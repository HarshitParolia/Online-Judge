import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from './firebase'
import { browserPopupRedirectResolver, OAuthProvider, GithubAuthProvider, GoogleAuthProvider, signInWithPopup, TwitterAuthProvider, FacebookAuthProvider } from 'firebase/auth'
import axios from 'axios'

const baseURL = import.meta.env.VITE_baseURL
const CustomContext = createContext();
const UseCustomContext = ({ children }) => {
    const [currentUser, setCurrentUser] = useState()
    const [renderconnected, setRenderconnected] = useState(false)
    const [loading, setLoading] = useState(true)
    const [userID, setUserID] = useState(0)

    async function signup(name1, email, password) {
        await auth.createUserWithEmailAndPassword(email, password)
        // setTimeout(() => {
        const namefinal = name1 || currentUser.displayName
        const emailfinal = email || currentUser.email
        try {
            axios.post(`${baseURL}/user/register`, {
                name: namefinal,
                userid: userID,
                email: emailfinal
            })
                .then(response => { //console.log(response); 
                })
                .catch(error => console.log("error creating user in FirebaseDB"))
        } catch (err) {
            console.log("Failed creating user with firebase")
        }
    }
    // , 2000)}


    async function login(email, password) {
        return auth.signInWithEmailAndPassword(email, password)
    }

    function logout() {
        localStorage.removeItem('tried')
        return auth.signOut()
    }

    function resetPassword(email) {
        return auth.sendPasswordResetEmail(email)
    }

    function updateEmail1(email) {
        return auth.currentUser.updateEmail(email)
    }

    function updatePassword1(password) {
        return auth.currentUser.updatePassword(password)
    }
    function deleteUser() {
        localStorage.removeItem('tried')
        return auth.currentUser.delete()
    }
    const handleGoogle = async () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider, browserPopupRedirectResolver)
    }
    const handleGithub = async () => {
        const provider = new GithubAuthProvider();
        return signInWithPopup(auth, provider, browserPopupRedirectResolver)
    }
    const handleMicrosoft = async () => {
        const provider = new OAuthProvider('microsoft.com')
        return signInWithPopup(auth, provider, browserPopupRedirectResolver)

    }
    const handleTwitter = async () => {
        const provider = new TwitterAuthProvider()
        return signInWithPopup(auth, provider, browserPopupRedirectResolver)

    }
    const handleFacebook = async () => {
        const provider = new FacebookAuthProvider()
        return signInWithPopup(auth, provider, browserPopupRedirectResolver)
    }
    const makeusername = (email, name) => {
        const random = Math.floor(Math.random() * 9000) + 1000;
        if (!name)
            return email.split('@')[0] + random.toString()
        const names = name.split(' ')[0] + random.toString()
        return names
    }
    const handleCreateUser = async (user) => {
        if (!user) return
        const name1 = makeusername(user.email, user.displayName)
        axios.post(`${baseURL}/user/register`, {
            name: name1,
            userid: user.uid,
            email: user.email || 'No email',
            profile_pic: user.photoURL || "http://www.gravatar.com/avatar/?d=mp"
        })
            .then(response => console.log(response))
            .catch(error => console.log("error creating user in my DB"))
        localStorage.setItem('tried', 1);
    }
    const checkHealthRender = async () => {
        if (renderconnected) return
        const { data: response } = await axios.get(`${baseURL}/health`)
        if (response == 'Server is running') setRenderconnected(true)
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user)
            if (user)
                setUserID(user.uid)
            if (!localStorage.getItem('tried'))
                handleCreateUser(user)
            if (!renderconnected)
                for (let i = 0; i < 10; i++) {
                    checkHealthRender()
                    if (renderconnected) break
                }
            // console.log(user)
            setLoading(false)
        })

        return unsubscribe
    }, [])

    return (
        <CustomContext.Provider value={{
            currentUser,
            login,
            signup,
            logout,
            handleGoogle,
            handleGithub,
            handleCreateUser,
            deleteUser,
            resetPassword,
            updateEmail1,
            updatePassword1,
            handleMicrosoft,
            handleTwitter,
            handleFacebook
        }}>
            {!loading && children}
        </CustomContext.Provider>
    )
}


export const useUserContext = () => {
    return useContext(CustomContext);
}
export default UseCustomContext