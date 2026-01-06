LINK: github repo:

FLAW 1: A02:2021 - Cryptographic Failures - Raw passwords were stored in plain text and passwords were logged onto the browser console.

Source: 
https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L56-L60


Description:
The ‘/save-user’ endpoint writes passwords as plain text, and those passwords are being saved into a csv file named ‘users.csv’, in addition to this, there are logs showing request bodies, e.g., ‘console.log(‘Login attempt:’, req.body)’. Also on the client side in ‘application.jsx’, passwords are being logged from cookies:https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/application.jsx#L54


Consequenses:
Due to having passwords in plain text, immediate theft of information is allowed. In case of a filesystem compromise, an accidental disclousure or other types of data leaks, this would happen. In addition, logging the credentials increases possibilities for an attacker through logs.

Fix:
Not storing passwords in plain text. Hashing the passwords with a modern hash (eg. using bcrypt library with enough salt rounds) This project has made a commented fix for hashing passwords, which uses the bcrypt library with semi sufficient amount of salt rounds. (see commented example at https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L118-L126 and L158-L170).
In addition to this, not logging full request bodies that contain any sensitive data. For example replacing "console.log('Login attempt:', req.body) with a "console.log('Login attempt for a user:", username)" (and no password here)
and lastly using HTTPS connection for data transits (if this were to go to production)

Flaw 2: A05:2021 - Securiyt misconfiguration - Sensitive data was leaked via cookies and logs.

Source:
Source (logs): https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L192
Source (cookie): https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/application.jsx#L54

Description:
Request bodies are logged by the server, and the frontend console logs cookie contents (even the password). The server also sets user-credentials cookie with full session data, and also has a setting "httpOnly:false", which allows client side scripts to read the password too. 

Consequenses: 
Too much information is leaked via console logs, browser tools or XSS accessible cookies, which can help with taking over accounts and harvesting information from those accounts.

Fix:
Removed sensitive logging, logging only non-sensitive data. Avoided storing credentials into non-httpOnly cookies. httpOnly cookies were only used for server-managed-session tokens, in other words JWTs. Also not storing password values into cookies. Made a seperate cookie for displaying the username (username cookie):https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L240-L259
