LINK: Github repo: https://github.com/Aulanko/cyber-security-vulnerable-app.git


FLAW 1: A02:2021 - Cryptographic Failures - Raw passwords were stored in plain text, and passwords were logged onto the browser console.
Source: https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L56-L60

Description: The ‘/save-user’ endpoint writes passwords as plain text, and those passwords are being saved into a csv file named ‘users.csv’, in addition to this, there are logs showing request bodies, e.g., ‘console.log(‘Login attempt:’, req.body)’. Also on the client side in ‘application.jsx’, passwords are being logged from cookies:https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/application.jsx#L54

Consequences: Due to having passwords in plain text, immediate theft of information is allowed. In case of a filesystem compromise, an accidental disclosure or other types of data leaks, this would happen. In addition, logging the credentials increases the possibilities for an attacker through the logs.

Fix: Not storing passwords in plain text. Hashing the passwords with a modern hash (eg, using the bcrypt library with enough salt rounds). This project has made a commented fix for hashing passwords, which uses the bcrypt library with a sufficient number of salt rounds. (see commented example at https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L118-L126 and L158-L170). In addition to this, not logging full request bodies that contain any sensitive data. For example, replacing "console.log('Login attempt:', req.body) with a "console.log('Login attempt for a user:", username)" (and no password here), and lastly using HTTPS connection for data transits (if this were to go to production)


FLAW 2: A05:2021 - Security misconfiguration - Sensitive data was leaked via cookies and logs.

Source: (logs): https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L190-L192 (cookie): https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/application.jsx#L54

Description: Request bodies are logged by the server, and the frontend console logs cookie contents (even the password). The server also sets a user-credentials cookie with full session data, and also has a setting "httpOnly:false", which allows client-side scripts to read the password too.
Consequences: Too much information is leaked via console logs, browser tools or XSS accessible cookies, which can help with taking over accounts and harvesting information from those accounts.

Fix: Removed sensitive logging, logging only non-sensitive data. Avoided storing credentials into non-httpOnly cookies. httpOnly cookies were only used for server-managed-session tokens, in other words, JWTs. Also, not storing password values in cookies. Made a separate cookie for displaying the username (username cookie):https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L336-L341


FLAW 3: A07:2021 - Identification & Authentication Failures - server-side session missed validation & session cookie could been manipulated.
Source: https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L226-L235

Description: username and password variables were stored into user credentials cookie, which also had httpOnly:false. This cookie was visible for client, which enables the attacker or client to edit this cookie. Therefore, one could impersonate other users without actually being logged in as them. The server-side did not have validation for operations such as blog posts. Requests were only dependent on the username.
Consequences: Horizontal privilege escalation and a successful but false impression were possible. A logged-in user could edit the cookie to "become" anyone and access their private content.

Fix: Removed the user credentials cookie entirely. Started using server-signed tokens (shortly, JWTs), which are stored in httpOnly, secure cookies. The server verifies the token and uses authentication for the username on the server when saving posts. Example: created an authenticate middleware that reads the auth token from the httpOnly cookie and verifies it: https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L94-L113


FLAW 4: A01:2021 - Broken Access Control - unauthorized & authenticated actions possible.

Source: (frontend unguarded route): https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/App.jsx#L86 (save-post accepts client username): https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L369-L376

Description: The frontend route "/application" is accessible for anyone. But this itself is not yet the issue. The issue is that by going to "/application", anyone can see other people's posts, as anonymous posts are allowed. Due to the backend's "/save-blog-post" route accepting requests without authenticated usernames, writes to the storage by anyone are possible.

Consequences: The attacker could create posts as he would like, spoofing anyone who comes to mind, without proper authorization. Private posts also could be misattributed.
Fix: One fix would be to gate the application route behind an authentication. Another one would just leave the application route open, for free, unsigned users, but would restrict their viewing and posting by authorization. Using server-side authorization to the "/save-blog-post" route with authenticate middleware and using req.user.username from the validated token instead of any client username. Validation to server side inputs (length limits and filtering dangerous characters)


FLAW 5: A08:2021 - Software and Data Integrity Failures - No rate limiting on login attempts

Source: (missing limiter) no login limiter applied to the login route (intended loginLimiter at https://github.com/Aulanko/cyber-security-vulnerable-app/blob/master/src/server.js#L82-L92, but it is not enforced in the active code)
Description: The login route accepts infinite attempts to log in. This is the dream case for attackers, who love brute forcing.

Consequences: Automated brute force attempts have a high probability of succeeding, and when they do, accounts with weak passwords get compromised easily.

Fix: Implemented a rate limiter for login, for example, the express-rate-limit library. Also, limiting attempts by IP addresses with exponential backoff time limits would add an extra layer of protection. Also, adding monitoring and alerts for suspicious activity, and adding multi-factor authentication would be excellent.


