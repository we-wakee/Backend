import {Router} from "express";
import { registerUser,loginUser ,logoutUser,RefreshAccessToken} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
const router = Router()

router.route("/register").post(

    upload.fields([
        {
            name:"avatar"
        },
    
        {
            name:"coverImage"
        }
    ]),
    registerUser

)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT,logoutUser)

router.route("/refresh-token").post(verifyJWT,RefreshAccessToken )


export default router