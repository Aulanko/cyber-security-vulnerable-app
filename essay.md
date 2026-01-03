LINK: github repo:

FLAW 1: A02:2021 - Cryptographic Failures - Raw passwords were stored in plain text and passwords were logged onto the browser console.

Source: 
https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L56-L60


Description:
The ‘/save-user’ endpoint writes passwords as plain text, and those passwords are being saved into a csv file named ‘users.csv’, in addition to this, there are logs showing request bodies, e.g., ‘console.log(‘Login attempt:’, req.body)’. Also on the client side in ‘application.jsx’, passwords are being logged from cookies:https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/application.jsx#L54
