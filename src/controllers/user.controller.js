import { response } from 'express'
import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import {ApiResponse} from '../utils/ApiResponse.js'


const generateAccessAndRefreshTokens = async(userId)=> {
    try{
        const user=User.findOne(userId)
        const accessToken=user.generateAccessToken()
        const refreshToken=user.generateRefreshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave : false})

        return {accessToken,refreshToken}
    }
    catch{
        throw new ApiError(500,"Something went wrong while generating refreshh/access token")
    }
}


const registerUser= asyncHandler(async (req,res)=>{
    
    // get user details from fronttend
    // validation - nt empty
    // check if user already exists: username, email
    // check for images , check for avatar
    // upload them to cloudinary 
    // create user object - create entry in db 
    // remove password and refrsh token from response
    // check for user creation 
    // return res


    const {fullName,email,username,password}=req.body
        // console.log("email " , email)

    if(
        [fullName,email,username,password].some((field)=>
        field?.trim()=== "")
    ){
        throw new ApiError(404, "error in ")
    }

    const ExistedUser = await User.findOne({
        $or : [{username} , {email}]
    })

    console.log(username,email)
    
    if(ExistedUser){
        throw new ApiError(409, "User with email or username already existed")
    }

    const avatarLocalPath= req.files?.avatar[0]?.path;
    // const coverImageLocalPath= req.files?.coverImage[0]?.path;
     
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length()>0){
        coverImageLocalPath=req.files.coverImage[0].path
    }
    
    console.log(coverImageLocalPath)
 
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
     
    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    } 

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    console.log(user)

    const createdUser=  await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering User")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered Successfully")
    )

   


})

const loginUser = asyncHandler(async(req,res)=>{
    // req body the data
    // username or email
    // find the user
    // password check
    // access and refreshToken
    // send cookie

    const {username,email,password} = req.body

    if(!(username || email)){
        throw new ApiError(400,"username or password is required")
    }

    const user= await User.findOne(
       { $or : [{username}, {email}]}
    )

    if(!user){
        throw new ApiError(404, "user does not exist")
    }


    const isPasswordCorrect= await user.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        throw new ApiError(401,"invalid user details")
    }

    const {accessToken,refreshToken}=await
    generateAccessAndRefreshTokens(user._id)

    const loggedInUser=await User.findOne(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser,accessToken,refreshToken
            },
            
                "User logged in successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined
            }
        }
    )
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User logged out Successfully~")
    )

})

const RefreshAccessToken= asyncHandler(async(req,res)=>{
    try{
        const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken

        if(incomingRefreshToken){
            throw new ApiError(401,"Unauthorized request")
        }
    
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user=await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired")
        }
    
        const options= {
            httpOnly: true,
            secure :true
        }
    
        const {newrefreshToken,accessToken}=await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newrefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken,refreshToken: newrefreshToken
                },
                "Access Token Refreshed"
            )
        
        )
    }
    catch(err){
        throw new ApiError(401,err?.message || "invalild refresh token") 
    }
})

export {registerUser,loginUser,logoutUser,RefreshAccessToken}