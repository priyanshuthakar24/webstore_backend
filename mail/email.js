const { VERIFICATION_EMAIL_TEMPLATE, WELOCME_EMAIL, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } = require("./emailTemplates");
const { mailtrapClient, sender, transporter } = require("./mailtrap.config");


exports.sendVerificationEmail = async (email, verificationToken) => {

    const recipient = [{ email }];

    try {
        await transporter.sendMail({
            from: sender.email,
            to: recipient[0].email,
            subject: "Verification Email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace('{verificationCode}', verificationToken),
            category: 'Email Verification',
        })
    } catch (error) {
        console.error(`Error sending verification`, error);

        throw new Error(`Error sending verification email: ${error}`);
    }
}

exports.sendWelcomeEmail = async (email, name) => {
    const recipient = [{ email }];
    try {
        await transporter.sendMail({
            from: sender.email,
            to: recipient[0].email,
            subject: 'WElcome Email',
            html: WELOCME_EMAIL.replace('{name}', name,).replace('{email}', email)
        })
    } catch (error) {
        console.error(`Error sending verification`, error);
        throw new Error(`Error sending verification email: ${error}`);
    }
}

exports.sendPasswordResetEmail = async (email, resetURL) => {
    const recipient = [{ email }];
    try {
        await transporter.sendMail({
            from: sender.email,
            to: recipient[0].email,
            subject: 'Reset your password',
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: 'Password Reset'
        })
    } catch (error) {
        console.log(`Error sending ppassword reset email`, error);
        throw new Error(`Error sending password reset email:${error}`);
    }
}

exports.sendResetSuccessEmail = async (email) => {
    const recipient = [{ email }];

    try {
        await transporter.sendMail({
            from: sender.email,
            to: recipient[0].email,
            subject: 'Password Reset Successful',
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: 'Password reset'
        })
    } catch (error) {
        console.error(`error sending password reset success email`, error);

        throw new Error(`Error sending password reset success email:${error}`);
    }
}


//! Mailtrap Configaration 

// exports.sendVerificationEmail = async (email, verificationToken) => {

//     const recipient = [{ email }];

//     try {
//         const response = await mailtrapClient.testing.send({
//             from: sender,
//             to: recipient,
//             subject: "Verification Email",
//             html: VERIFICATION_EMAIL_TEMPLATE.replace('{verificationCode}', verificationToken),
//             category: 'Email Verification',
//         })
//         console.log("Email sent successfully", response);
//     } catch (error) {
//         console.error(`Error sending verification`, error);

//         throw new Error(`Error sending verification email: ${error}`);
//     }
// }

// --------------------------------------

// exports.sendWelcomeEmail = async (email, name) => {
//     const recipient = [{ email }];
//     try {
//         const response = await mailtrapClient.testing.send({
//             from: sender,
//             to: recipient,
//             subject: 'WElcome Email',
//             html: WELOCME_EMAIL.replace('{name}', name, '{email}', email)
//         })
//         console.log("Welcome email sent successfully", response);
//     } catch (error) {
//         console.error(`Error sending verification`, error);
//         throw new Error(`Error sending verification email: ${error}`);
//     }
// }
// --------------------------
// exports.sendPasswordResetEmail = async (email, resetURL) => {
//     const recipient = [{ email }];
//     try {
//         const response = await mailtrapClient.testing.send({
//             from: sender,
//             to: recipient,
//             subject: 'Reset your password',
//             html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
//             category: 'Password Reset'
//         })
//     } catch (error) {
//         console.log(`Error sending ppassword reset email`, error);
//         throw new Error(`Error sending password reset email:${error}`);
//     }
// }

// ------------------------------------
// exports.sendResetSuccessEmail = async (email) => {
//     const recipient = [{ email }];

//     try {
//         const response = await mailtrapClient.testing.send({
//             from: sender,
//             to: recipient,
//             subject: 'Password Reset Successful',
//             html: PASSWORD_RESET_SUCCESS_TEMPLATE,
//             category: 'Password reset'
//         })
//         console.log("password Reset email sent successfully", response)
//     } catch (error) {
//         console.error(`error sending password reset success email`, error);

//         throw new Error(`Error sending password reset success email:${error}`);
//     }
// }