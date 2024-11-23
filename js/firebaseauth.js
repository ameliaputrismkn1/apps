import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA8VvXw710toyzNQ-prNycI5OhPh3bm8YI",
    authDomain: "byetrash.firebaseapp.com",
    projectId: "byetrash",
    storageBucket: "byetrash.firebasestorage.app",
    messagingSenderId: "875231949079",
    appId: "1:875231949079:web:505c1630d3bdb4ebf10752",
    measurementId: "G-58NKS6S5T5"
};

const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();

function showMessage(message, divId) {
    var messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(function () {
        messageDiv.style.opacity = 0;
    }, 5000);
}

const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const firstName = document.getElementById('fName').value;
    const lastName = document.getElementById('lName').value;

    const auth = getAuth();
    const db = getFirestore();

    console.log('Attempting to create user with email:', email);

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User created:', user);
            if (user) {
                sendEmailVerification(user);
            }
            const userData = {
                email: email,
                firstName: firstName,
                lastName: lastName
            };
            showMessage('Account Created Successfully', 'signUpMessage');
            const docRef = doc(db, "users", user.uid);
            setDoc(docRef, userData)
                .then(() => {
                    console.log('User data saved to Firestore');
                    window.location.href = 'index.html';
                })
                .catch((error) => {
                    console.error("Error writing document", error);
                });
        })
        .catch((error) => {
            const errorCode = error.code;
            console.error('Error creating user:', errorCode, error.message);
            if (errorCode == 'auth/email-already-in-use') {
                showMessage('Email Address Already Exists !!!', 'signUpMessage');
            } else {
                showMessage('Unable to create User', 'signUpMessage');
            }
        });
});

const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const auth = getAuth();

    console.log('Attempting to sign in with email:', email);

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log('User signed in:', user);
            if (user.emailVerified) {
                showMessage('Login is successful', 'signInMessage');
                localStorage.setItem('loggedInUserId', user.uid);
                window.location.href = 'homepage.html';
            } else {
                showMessage('Please verify your email before logging in', 'signInMessage');
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            console.error('Error signing in:', errorCode, error.message);
            if (errorCode === 'auth/invalid-credential') {
                showMessage('Incorrect Email or Password', 'signInMessage');
            } else {
                showMessage('Account does not Exist', 'signInMessage');
            }
        });
});

const googleSignIn = document.getElementById('googleSignIn');
googleSignIn.addEventListener('click', (event) => {
    event.preventDefault();
    const auth = getAuth();
    console.log('Attempting Google Sign-In');

    signInWithPopup(auth, provider)
        .then((result) => {
            const user = result.user;
            console.log('Google Sign-In successful:', user);
            const db = getFirestore();
            const docRef = doc(db, "users", user.uid);
            getDoc(docRef)
                .then((docSnap) => {
                    if (!docSnap.exists()) {
                        const userData = {
                            email: user.email,
                            firstName: user.displayName.split(' ')[0],
                            lastName: user.displayName.split(' ')[1] || ''
                        };
                        setDoc(docRef, userData)
                            .then(() => {
                                showMessage('Google Sign-In Successful', 'signInMessage');
                                localStorage.setItem('loggedInUserId', user.uid);
                                window.location.href = 'homepage.html';
                            })
                            .catch((error) => {
                                console.error("Error writing document", error);
                            });
                    } else {
                        showMessage('Google Sign-In Successful', 'signInMessage');
                        localStorage.setItem('loggedInUserId', user.uid);
                        window.location.href = 'homepage.html';
                    }
                })
                .catch((error) => {
                    console.error("Error getting document", error);
                });
        })
        .catch((error) => {
            showMessage('Google Sign-In Failed', 'signInMessage');
            console.error("Google Sign-In Error: ", error);
        });
});

const resetPassword = document.getElementById('resetPassword');
resetPassword.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const auth = getAuth();

    sendPasswordResetEmail(auth, email)
        .then(() => {
            showMessage('Password reset email sent!', 'signInMessage');
        })
        .catch((error) => {
            showMessage('please enter email and refresh!', 'signInMessage');
            console.error("Password Reset Error: ", error);
        });
});