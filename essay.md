LINK: github repo: https://github.com/Aulanko/cyber-security-vulnerable-app.git

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
(logs): https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L190-L192
(cookie): https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/application.jsx#L54

Description:
Request bodies are logged by the server, and the frontend console logs cookie contents (even the password). The server also sets user-credentials cookie with full session data, and also has a setting "httpOnly:false", which allows client side scripts to read the password too. 

Consequenses: 
Too much information is leaked via console logs, browser tools or XSS accessible cookies, which can help with taking over accounts and harvesting information from those accounts.

Fix:
Removed sensitive logging, logging only non-sensitive data. Avoided storing credentials into non-httpOnly cookies. httpOnly cookies were only used for server-managed-session tokens, in other words JWTs. Also not storing password values into cookies. Made a seperate cookie for displaying the username (username cookie):https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L336-L341


Flaw 3: A07:2021 - Identification & Authentication Failures -  server side session missed validation & session cookie could been manipulated.

Source: https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L226-L235

Description:
username and password variables were stored into user credentials cookie which also had httpOnly:false. This cookie was visible for client, which enables attacker or client to edit this cookie. Therefore one could impressionate other users without being actually logged in as them. The server side did not have validation for operations such as blog posts. Requests were only dependent on username.

Consequences:
Horizontal privilege escalation and succesful but false-impressionation was possible. Logged in user could edit the cookie to "become" anyone, and access their private content.

Fix:
Removed the user credentials cookie entirely. Started using server signed tokens (shortly; JWTs), which are stored in httPOnly, secure cookies. The server verifyes the token, and uses auhtentication for username on server, when saving posts. 
Example: created authenticate middleware that reads auth token from httpOnly cookie and verifies it: https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L94-L113

Flaw 4: A01:2021 - Broken Access Control - unauthorized & authenticated actions possible.

Source:
(frontend unguarded route): https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/App.jsx#L86
(save-post accepts client username): https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L369-L376


Description:
The frontend route route "/application" is accesible for anyone. But, this itself is not yet the issue. The issue is that by going to "/application" anyone, could see other peoples posts, by being able to post anonymously a post. Due to the backend's "/save-blog-post" route accepting requests without authenticated usernames, writes to the storage by anyone is possible. 

Consequences:
Attacker could create posts as he would like, spoofing anyone who comes to mind, without a proper authorization. Private posts also could be mistatributed.

Fix:
One fix would be to gate the application route behind an authentication. Another one would just to leave the application route open, for free unsigned users, but would restrict their viewing and posting by authorization. Using Server side authorization to "/save-blog-post" route with authenticate middleware and using req.user.username from the validated token instead of any client username. Validation to server side inputs ( lenght limits and filtering dangerous characters)


Flaw 5: A08:2021 - Software and Data Integrity Failures - No rate limiting on login attempts 

Source:
(missing limiter) no login limiter applied to the login route (intended loginLimiter at https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L24-L36, but it is not enforced in the active code)

Description:
The login route accepts infinite attempts to login. This is the dream case for attackers, who love brute forcing.

Consequences:
Automated brute force-attemps have a high propability to succeed, and when they do, accounts with weak passwords get compromised easily.

Fix:
Implemented a rate limiter for login, for example the express-rate-limit library. Also limit attempts by IP addresses with exponential backoff time limits would add an extra layer of protection. Also adding monitoring, and alerts for suspicious activity, and adding multi-factor authentication would be excellent.






