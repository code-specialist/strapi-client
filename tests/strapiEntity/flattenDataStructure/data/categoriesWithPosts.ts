export const response = {
    "data": [
        {
            "id": 24,
            "attributes": {
                "name": "Good To Know",
                "slug": "good-to-know",
                "hexColor": "#7ddcc8",
                "createdAt": "2023-04-10T16:14:27.438Z",
                "updatedAt": "2023-04-10T16:14:27.438Z",
                "publishedAt": "2023-04-10T16:14:27.431Z",
                "posts": {
                    "data": [
                        {
                            "id": 16,
                            "attributes": {
                                "title": "Linux Multi-Factor Authentication",
                                "content": "\nMulti-factor authentication is all around us nowadays. And for a good reason,\nsingle layers of authentication are easily compromised by leaked credentials,\nexposed keys or even third party security leaks.\n\nHowever, there is no reason to get paranoid. Two or at most three\nare enough when it comes to layers of authentication. The risk of\nlocking out yourself increases with each layer and restoring gets trickier too.\n\nAlso, various layers of authentication do not necessarily mean your server is\nmore secure each layer may be a vulnerability itself if not choosen wisely.\n\nI usually use two layers:\n\n- SSH-Key\n- Time-based one-time Password (TOTP)\n\nIn the following three sections we're going through basic security measures and\nhow to configure your server to apply SSH-Key and TOTP (**Google\nAuthenticator**) based authentication. But first of all we start with some basic\nsecurity measures.\n\n<InfoBox>\n  In this example we're going to assume you use <b>Ubuntu 20.04</b>, but most\n  concepts are easy to adjust to various operating systems and require only\n  slight to none changes using another ubuntu version. <br />\n  <br />\n  This is a practical how-to, we assume you know about the basics.{' '}\n  <b>Be careful when changeing security related settings</b>. You may easily\n  lock yourself out or even create vulnerabilities if you lack proper knowledge\n  of what you're doing. <b>Do not apply anything blindly.</b>\n  <br />\n  <br />\n  To lessen the chance of a full lock out, you might want to keep a second ssh session\n  connected at all time while applying the steps below.\n</InfoBox>\n\n## Basic Security\n\nYour auth layers are basically useless if they're exorbitantly vulnerable. The least you\nshould do, is to make sure everything is up to date, disable the root login and\nconfigure a basic firewall.\n\n### Update\n\nFirst thing you should do when configuring a new Linux server, is to update the packages\n\n1. Update package lists\n\n   ```shell\n   sudo apt-get update\n   ```\n\n   ---\n\n2. Upgrade the packages\n\n   ```shell\n   sudo apt-get upgrade -y\n   ```\n\n### Deactivate Root Login\n\nOne thing you really should do as your second action when configuring a new\nserver, is to disable the root user or atleast prohibit login with it. The root\nis simply to mighty and a leak of its credentials is your servers armageddon.\n\n1. Connect via SSH\n\n   ```shell\n   ssh root@111.11.11.11\n   root@111.11.11.11 password:\n   ```\n\n   ---\n\n2. Create a new user\n\n   ```shell\n   sudo adduser codespecialist\n   ```\n\n   **Shell output**\n\n   ```shell\n   Adding user `codespecialist' ...\n   Adding new group `codespecialist' (1000) ...\n   Adding new user `codespecialist' (1000) with group `codespecialist' ...\n   Creating home directory `/home/codespecialist' ...\n   Copying files from `/etc/skel' ...\n   New password:\n   Retype new password:\n   passwd: password updated successfully\n   Changing the user information for codespecialist\n   Enter the new value, or press ENTER for the default\n         Full Name []:\n         Room Number []:\n         Work Phone []:\n         Home Phone []:\n         Other []:\n   Is the information correct? [Y/n]\n   ```\n\n   ---\n\n3. Add the user to sudoers\n\n   ```shell\n   usermod -aG sudo codespecialist\n   ```\n\n   ***\n\n4. Switch and check permissions\n\n   ```shell\n   su codespecialist\n   sudo ls\n   ```\n\n   **Shell output**\n\n   ```shell\n   codespecialist@ubuntu:~$ sudo ls\n   [sudo] password for codespecialist:\n   codespecialist@ubuntu:~$\n   ```\n\n   If the sudo command succeeds, then you have been successfully aded to the\n   sudoers.\n\n   ***\n\n5. Test logging in\n\n   ```shell\n   ssh codespecialist@111.11.11.11\n   ```\n\n   You should be able to login with the credentials you just created.\n\n   ***\n\n6. Disable the root login\n\n   Open the `sshd_config`\n\n   ```shell\n   sudo nano /etc/ssh/sshd_config\n   ```\n\n   find the `PermitRootLogin` entry and change it to `no`\n\n   ```config{numberLines: true}\n   # Authentication:\n\n   ...\n\n   PermitRootLogin no\n\n   ...\n   ```\n\n   ***\n\n7. Restart the SSHD service\n\n   ```shell\n   sudo systemctl restart sshd\n   ```\n\n   ***\n\n8. Test it\n\n   Open a second terminal and try to connect as root\n\n   ```\n   ssh root@111.11.11.11\n   ```\n\n   **Shell output**\n\n   ```shell\n   root@111.11.11.11's password:\n   Permission denied, please try again\n   ```\n\n### Set up a Firewall\n\nTo restrict access from and to ports, you might want to add a basic firewall.\nOne firewall widely used is the [Uncomplicated Firewall\n(UFW)](https://en.wikipedia.org/wiki/Uncomplicated_Firewall)\n\n1. Install UFW\n\n   ```shell\n   sudo apt-get install ufw\n   ```\n\n   ***\n\n2. Add SSH firewall rule\n\n   Allow ssh connections, either by applying `sudo ufw allow ssh` or `sudo ufw allow 22`.\n\n   ```shell\n   sudo ufw allow ssh\n   ```\n\n   **Shell output**\n\n   ```shell\n   [sudo] password for codespecialist:\n   Rules updated\n   Rules updated (v6)\n   ```\n\n   Make sure this step proceeds by checking the output. Else, you might lock out\n   yourself and exstinguish any chance to restore the server as well.\n\n   ***\n\n3. Enable the firewall\n\n   ```shell\n   sudo ufw enable\n   ```\n\n   When you use the `ufw enable` command, UFW will be started, and also\n   registered as a service started on system startup.\n\n## Authenticate using a SSH-Key\n\nUsing a SSH-Key is an easy way to improve security without increasing the number\nof manually provided credentials. All you have to do is configure your local ssh-agent\nand provide your public key to the machine your want to secure. You need to\napply the following steps on your local machine.\n\n<InfoBox>\n   This section requires you to have installed <b>openshh-client</b>. This\n   should be preinstalled on most operating systems. But you might have to find\n   a work-arround when using Windows.\n</InfoBox>\n\n1. [Optional] Create a SSH-Key\n\n   If you do not have a ssh key yet, you can create a new one. It's possibly a\n   good choice to add a comment with `-C` to allocate it correctly later on.\n   Follow the instructions given by the CLI. Also, make sure not to loose the\n   private key created in this step. Its also recommended you use a passphrase\n   in order for the key to be encrypted with AES-CBC instead of lying arround as\n   plain text files\n\n   ```shell\n   ssh-keygen -t ed25519 -C \"codespecialist@111.11.11.11\"\n   ```\n\n   **Shell output**\n\n   ```shell\n   ssh-keygen -t ed25519 -C \"codespecialist@111.11.11.11\"\n   Generating public/private ed25519 key pair.\n   Enter file in which to save the key (/Users/codespecialist/.ssh/id_ed25519): /Users/codespecialist/.ssh/codespecialist\n   Enter passphrase (empty for no passphrase):\n   Enter same passphrase again:\n   Your identification has been saved in /Users/codespecialist/.ssh/codespecialist\n   Your public key has been saved in /Users/codespecialist/.ssh/codespecialist.pub\n   The key fingerprint is:\n   SHA256:ggejZWoZgOYJL4epj/IkvL34z0T3Var+GBS6K93kiTo codespecialist@111.11.11.11\n   The key's randomart image is:\n   +--[ED25519 256]--+\n   |o                |\n   |oo               |\n   |+=. =    .   .   |\n   |=.oB +  . . +    |\n   |.o= ..ooS. o     |\n   |o.  ....+.o      |\n   |.+.  ...=+.      |\n   |oo= oE oo+o      |\n   |.+o+o++. o..     |\n   +----[SHA256]-----+\n   ```\n   \n   ---\n\n2. Add the key to the server\n\n   ```shell\n   ssh-copy-id -i ~/.ssh/codespecialist codespecialist@111.11.11.11\n   ```\n\n   **Shell output**\n\n   ```shell\n   ssh-copy-id -i /Users/codespecialist/.ssh/codespecialist codespecialist@111.11.11.11\n   /usr/bin/ssh-copy-id: INFO: Source of key(s) to be installed: \"/Users/codespecialist/.ssh/codespecialist.pub\"\n   /usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s), to filter out any that are already installed\n   /usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed -- if you are prompted now it is to install the new keys\n   codespecialist@111.11.11.11's password:\n\n   Number of key(s) added:        1\n\n   Now try logging into the machine, with:   \"ssh 'codespecialist@111.11.11.11'\"\n   and check to make sure that only the key(s) you wanted were added.\n   ```\n\n   ---\n\n3. Check if the key was added correctly on the remote host\n\n   ```shell\n   cat ~/.ssh/authorized_keys\n   ```\n\n   **Shell output**\n\n   ```shell\n   ssh-ed25519 AAAAC3NzaC2lZDI1NTE5AAAAIMdM36AX6tY/+vnPSQ4JLB20SP2ANU7js8uBnIzlQHFf codespecialist@111.11.11.11\n   ```\n\n   ---\n\n4. Disable password authentication\n\n   Edit your `sshd_config` and change the `PasswordAuthentication` from `yes` to `no`\n\n   ```shell\n   sudo nano /etc/ssh/sshd_config\n   ```\n\n   ```\n   ...\n   PasswordAuthentication no\n   ...\n   ```\n\n   ---\n\n5. Restart the SSHD service\n\n   ```shell\n   sudo systemctl restart sshd\n   ```\n\n   ---\n\n6. Login using the SSH-Key\n\n   Logging in without password should now be possible, but at the same time,\n   only your SSH-Key will be accepted from now on.\n\n   ```shell\n   ssh -i ~/.ssh/codespecialist codespecialist@111.11.11.11\n   ```\n\n## Authenticate using the Google-Authenticator\n\nNow that we have a decent authentication mechanism and some basic security\nfeatures, lets add a second layer to the authentication.\n\n<InfoBox>\nMake sure you are logged in to the remote host with the user you want to use in\nfuture, as the google authenticator is only configured for this specific user.\n<br/><br/>\n\nAlso, please open a second SSH connection to the server and keep it open until\nyou're sure, the google autenticator is working properly. Otherwise you might\nlock out yourself with a single misconfiguration.\n</InfoBox>\n\n1. Install the google authenticator \n   \n   ```shell   \n   sudo apt-get install libpam-google-authenticator\n   ```\n\n   ---\n\n2. Run the google authenticator script\n\n   Once you followed the steps of the google authenticator, a QR-code will be\n   generated in the shell, that you can scan with an authenticator app on your\n   smartphone, tablet or whatever. Just make sure, its not your local machine, as\n   the authentication layer is horribly ineffective against attackers compormising\n   your local machine.\n\n   ```shell\n   google-authenticator\n   ```\n\n   **Shell output** \n\n   ```shell\n\n   Do you want authentication tokens to be time-based (y/n) y\n   Warning: pasting the following URL into your browser exposes the OTP secret to Google:\n\n   Your new secret key is: G2URAC442DYGBIJDCDHY2HTFNM\n   Your verification code is 221804\n   Your emergency scratch codes are:\n   25690887\n   90233439\n   52851954\n   71051205\n   30624510\n\n   Do you want me to update your \"/home/codespecialist/.google_authenticator\" file? (y/n) y \n\n   Do you want to disallow multiple uses of the same authentication\n   token? This restricts you to one login about every 30s, but it increases\n   your chances to notice or even prevent man-in-the-middle attacks (y/n) y\n\n   By default, a new token is generated every 30 seconds by the mobile app.\n   In order to compensate for possible time-skew between the client and the server,\n   we allow an extra token before and after the current time. This allows for a\n   time skew of up to 30 seconds between authentication server and client. If you\n   experience problems with poor time synchronization, you can increase the window\n   from its default size of 3 permitted codes (one previous code, the current\n   code, the next code) to 17 permitted codes (the 8 previous codes, the current\n   code, and the 8 next codes). This will permit for a time skew of up to 4 minutes\n   between client and server.\n   Do you want to do so? (y/n) y\n\n   If the computer that you are logging into isn't hardened against brute-force\n   login attempts, you can enable rate-limiting for the authentication module.\n   By default, this limits attackers to no more than 3 login attempts every 30s.\n   Do you want to enable rate-limiting? (y/n) y\n   ```\n\n   Make sure to write down these scratch codes, as they are the only thing that\n   may help you, if you loose or damage your device with the TOTP-App.\n\n   ---\n\n3. Add the google authenticator as a auth factor\n\n   ```shell\n   sudo nano /etc/pam.d/sshd\n   ```\n\n   Search for the `@include common-auth` line which should be at the very\n   beginning and comment it out.\n\n   ```config\n   #@include common-auth\n   ```\n   \n   Add the authenticator module at the bottom of the file\n\n   ```config\n   auth required pam_google_authenticator.so\n   ```\n\n   ---\n\n4. Adjust the SSHD config\n\n   There are several things in the config you have to change or assure this\n   time:\n   \n   - `ChallengeResponseAuthentication` is set to  `yes`\n   - `UsePAM` is set to  `yes`\n   - `AuthenticationMethods` is set to  `publickey,keyboard-interactive`\n\n   ```shell\n   ...\n   ChallengeResponseAuthentication yes\n   ...\n   UsePAM yes\n   ...\n   AuthenticationMethods publickey,keyboard-interactive\n   ```\n\n   ---\n\n5. Restart the SSHD service\n\n   ```shell\n   sudo systemctl restart sshd\n   ```\n\n   ---\n\n6. Test it\n\n   When try you open a new ssh session with the server, it is going to ask for a\n   verification code, which should accept the one your TOTP app displays.\n\n   ```shell\n   ssh -i .ssh/codespecialist codespecialist@111.11.11.11\n   ```\n\n   **Shell output**\n\n   ```\n   (codespecialist@111.11.11.11) Verification code: \n   ```\n\n## Congratulations!\n\nYour remote host is now a bit more secure, and the likelyhood of you being a\nvictim of bruteforce attacks significantly lower. If you are interested in\nfurther ways to improve security, system hardening is the topic to look\ninto next. \n\nIf you encounter any issues please comment below, so we can provide a solution\nand improve this article.",
                                "slug": "mfa-linux",
                                "publishDate": "2022-04-04",
                                "excerpt": "Read about how to apply multi-factor authentication on Linux (servers), to sleep better even though you know your server is publicly available",
                                "createdAt": "2023-04-10T16:38:47.516Z",
                                "updatedAt": "2023-04-10T16:38:47.516Z",
                                "publishedAt": "2023-04-10T16:38:47.513Z",
                                "author": {
                                    "data": {
                                        "id": 4,
                                        "attributes": {
                                            "name": "Yannic Schröer",
                                            "slug": "yannic",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-05-02T15:39:45.245Z",
                                            "publishedAt": "2023-04-10T16:03:39.313Z",
                                            "image": {
                                                "data": {
                                                    "id": 3,
                                                    "attributes": {
                                                        "name": "Unbenannt.PNG",
                                                        "alternativeText": null,
                                                        "caption": null,
                                                        "width": 879,
                                                        "height": 699,
                                                        "formats": {
                                                            "small": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/small_Unbenannt_bb5374b218.PNG",
                                                                "hash": "small_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "small_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 18.44,
                                                                "width": 500,
                                                                "height": 398
                                                            },
                                                            "medium": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/medium_Unbenannt_bb5374b218.PNG",
                                                                "hash": "medium_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "medium_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 29.78,
                                                                "width": 750,
                                                                "height": 596
                                                            },
                                                            "thumbnail": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/thumbnail_Unbenannt_bb5374b218.PNG",
                                                                "hash": "thumbnail_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "thumbnail_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 7.33,
                                                                "width": 196,
                                                                "height": 156
                                                            }
                                                        },
                                                        "hash": "Unbenannt_bb5374b218",
                                                        "ext": ".PNG",
                                                        "mime": "image/png",
                                                        "size": 6.96,
                                                        "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/Unbenannt_bb5374b218.PNG",
                                                        "previewUrl": null,
                                                        "provider": "aws-s3",
                                                        "provider_metadata": null,
                                                        "createdAt": "2023-04-11T08:44:21.712Z",
                                                        "updatedAt": "2023-05-02T14:58:57.730Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        },
        {
            "id": 25,
            "attributes": {
                "name": "Cloud",
                "slug": "cloud",
                "hexColor": "#56b673",
                "createdAt": "2023-04-10T16:14:27.448Z",
                "updatedAt": "2023-04-10T16:14:27.448Z",
                "publishedAt": "2023-04-10T16:14:27.439Z",
                "posts": {
                    "data": [
                        {
                            "id": 3,
                            "attributes": {
                                "title": "Self Signed SSL Certificate in NextJS",
                                "content": "## Problem Statement\n\nRecently, I encountered the Error `DEPTH_ZERO_SELF_SIGNED_CERT` with a NextJS\napp. After millenias of debugging, of course, since no meaningful error message\narose. My app simply refused to process requests to the `/api/*` routes of the\napp. \n\nReading multiple GitHub Discussion, GitHub Issues and StackOverflow answers\nlike:\n\n- https://github.com/vercel/next.js/discussions/10935\n- https://stackoverflow.com/questions/70440486/locally-developing-nextjs-and-fetch-getting-self-signed-cert-error/71558621\n\nbrought me nowhere. \n\nThere are several development scenarios in which self signing a certificate is\nuseful and common practice so I was a bit salty about the lacking support.\n\n## Solution\n\nI found the solution to this problem buried somewhere deep in the Node\ndocumentation. There is an option to disable the rejection of unauthorized TLS\ncertiticates `NODE_TLS_REJECT_UNAUTHORIZED`. So, adding this to NextJS dev\nscript did the trick for me:\n\n```js\n...\n\"scripts\": {\n        \"dev\": \"NODE_TLS_REJECT_UNAUTHORIZED=0 next dev\",\n\t\t...\n    },\n...\n```",
                                "slug": "nextjs-self-signed",
                                "publishDate": "2022-12-29",
                                "excerpt": "Get rid of the DEPTH_ZERO_SELF_SIGNED_CERT error in NextJS when using a self signed SSL certificate.",
                                "createdAt": "2023-04-10T16:37:54.253Z",
                                "updatedAt": "2023-05-02T15:01:02.942Z",
                                "publishedAt": "2023-04-10T16:37:54.248Z",
                                "author": {
                                    "data": {
                                        "id": 4,
                                        "attributes": {
                                            "name": "Yannic Schröer",
                                            "slug": "yannic",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-05-02T15:39:45.245Z",
                                            "publishedAt": "2023-04-10T16:03:39.313Z",
                                            "image": {
                                                "data": {
                                                    "id": 3,
                                                    "attributes": {
                                                        "name": "Unbenannt.PNG",
                                                        "alternativeText": null,
                                                        "caption": null,
                                                        "width": 879,
                                                        "height": 699,
                                                        "formats": {
                                                            "small": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/small_Unbenannt_bb5374b218.PNG",
                                                                "hash": "small_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "small_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 18.44,
                                                                "width": 500,
                                                                "height": 398
                                                            },
                                                            "medium": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/medium_Unbenannt_bb5374b218.PNG",
                                                                "hash": "medium_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "medium_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 29.78,
                                                                "width": 750,
                                                                "height": 596
                                                            },
                                                            "thumbnail": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/thumbnail_Unbenannt_bb5374b218.PNG",
                                                                "hash": "thumbnail_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "thumbnail_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 7.33,
                                                                "width": 196,
                                                                "height": 156
                                                            }
                                                        },
                                                        "hash": "Unbenannt_bb5374b218",
                                                        "ext": ".PNG",
                                                        "mime": "image/png",
                                                        "size": 6.96,
                                                        "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/Unbenannt_bb5374b218.PNG",
                                                        "previewUrl": null,
                                                        "provider": "aws-s3",
                                                        "provider_metadata": null,
                                                        "createdAt": "2023-04-11T08:44:21.712Z",
                                                        "updatedAt": "2023-05-02T14:58:57.730Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 6,
                            "attributes": {
                                "title": "Form Endpoint to send Emails with AWS Lambda and AWS SES",
                                "content": "\nHandling form submissions is (still) a time-consuming and disappointing task.\nSometimes all you want is to create a form that triggers an email with the\nprovided details. The sad truth is, there is no such solution available for free.\n\nBut there is a solution that comes with nearly zero cost and effort: Utilizing\n[AWS Lambda](https://aws.amazon.com/lambda/) and\n[AWS Simple Email Service (SES)](https://aws.amazon.com/ses/).\n\n![Form data to email architecture proposal](/assets/blog/posts/form_aws_lambda/aws-gateway-lambda-ses-form-data-architecture.svg)\n\nIf you never worked with AWS, no worries,\nthis requires absolutely no in-depth knowledge. All you need to know, is how to\n[navigate AWS](https://www.youtube.com/watch?v=A43m4TDFCUM). However, I recommend you read\nabout the\n[Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)\nand to create a\n[budget alert](https://docs.aws.amazon.com/cost-management/latest/userguide/budgets-create.html)\nwhen you're starting to use AWS to avoid costly mistakes.\n\n## Components\n\nEven though it might seem trivial, I want to lose a few words to the components\nin use. Feel free to skip this section if you're already familiar with the AWS\nAPI Gateway, AWS Lambda, and AWS SES Services.\n\n### API Gateway\n\nThe API Gateway is a fully managed service that allows exposing business logic\nvia API endpoints. The API Gateway supports containerized, serverless workloads\nas well as web applications. It is the entry point to your application logic.\n\nWe utilize its feature to invoke Lambdas via a public endpoint in our case.\n\n### Lambda\n\nLambda is based on the serverless concept. Instead of ever-running EC2 instances\n(the AWS solution for virtual machines), lambdas only consume resources when\nthey are invoked. The actual costs are calculated in Gigabyteseconds (GBS). This unit\nis calculated by multiplying the required main memory times the execution time. For\nexample, if you have a memory consumption of 80MB and your Lambda takes 560ms to\ncompute, this equals ~0.044GBS\n\n<math>\n  GBS(80MB,560ms) = \\frac{'{'}80{'}'}\n  {'{'}1024{'}'}GB*0.56s = 0.04375 GBS\n</math>\n\n1GBS is currently billed at _$0.00001667_ which means your request effectively\ncosts _$0.0000007293125_ or in other words, you can make about 1.37\nmillion requests until you have to pay a single dollar.\n\nThe savings in resources are hilariously high. While virtual machines usually\ncost at least a few cents an hour at any given cloud provider; you can make\nthousands of serverless requests until you have to pay the same.\n\n### Simple Email Service (SES)\n\nThe AWS SES is a service to send and receive emails. It supports various nice\nfeatures such as DKIM. This will almost certainly ensure your mails won't get\ntagged as spam as long as your content does not behave like phishing.\n\nTo use SES in this scenario, you will have to confirm the email or domain you're\ngoing to use to send mails. The SES wizard is clear and concise about the\ninstructions; you should not run into any issues here.\n\n## Why use AWS\n\nWhen it comes to architecture, in 9 of 10 cases, the definitive answer to your\nquestion is: _„it depends“_. So maybe let's take one step back and talk about\nwhy this solution might fit your use case.\n\nThe two factors that led to my decision were **Availability** and **Costs**.\nNeither is a solution with low availability nor high costs tolerable for\nsubmitting mere forms.\n\n### Availability\n\nThe availability of this solution is at least **99,9%**. Which equals about 8.7\nhours of downtime per year. The AWS API Gateway and the AWS Lambda Service have\nan availability of at least 99,95%, according to their service level agreements (SLA).\n\n<math>Availability(API Gateway, Lambda)=0.9995 * 0.9995=~0.999 = 99.9\\%</math>\n\nThis is enterprise level availability and most likely much higher than the\navailability of your self-hosted backend. Also, if necessary, it would be pretty\neasy to increase the availability by utilizing availability zones, for instance.\n\n### Costs\n\nThe costs are staggeringly low. All of this easily fits in the free-tier\noffering of AWS and thereby your costs for the first 12 months would be $0.\n\nAfter that, your costs are that low; they won't even sum up to a total of $1 per\nyear. But let's calculate that.\n\nLet's assume:\n\n- your website is frequently visited, and 50 people submit a form each day\n- the lambda takes 75MB of main memory and 80ms to complete (my average)\n\nThat would be _18250 submissions_ (50\\*365) and _~107GBS_\n(75/1024GB\\*0,08s\\*18250 submissions) per year.\n\n- 18250 requests via the API Gateway are billed with $0.0219 ($1.20 per million)\n- 107 GBS via Lambda are billed at $0.00178 ($0.00001667 per GBS)\n- 18250 emails via SES are billed with $0 (the first 62 000 each month are free)\n\nThis sums up to a _total of $0.02 per year_. I don't think there is any other\nmanaged solution that can match these costs. But feel free to prove me wrong\nin the comments.\n\n## Lambda Function\n\nFirst, we create a new lambda. Navigate to **Lambda** on the AWS Cloud web\ninterface. Make sure your region is set correctly (at the top bar on the\nright side). Click on _Create function_, add your desired function name and\nselect NodeJS as runtime, and click on _Create function_ again (at the bottom).\n\nAfter the creation succeeded, you should now be in the integrated code editor\nwith some default code:\n\n```javascript\nexports.handler = async event => {\n  // TODO implement\n  const response = {\n    statusCode: 200,\n    body: JSON.stringify('Hello from Lambda!')\n  }\n  return response\n}\n```\n\nAs you can see here, a lambda function is exported by `exports.handler` and is\nan asynchronous function with a single argument `event`.\n\nNow let's paste in our code to process the form submission:\n\n```javascript\nconst AWS = require('aws-sdk') // Import the aws sdk\nconst ses = new AWS.SES({ region: 'eu-central-1' }) // Create an SES client bound to eu-central-1\n\nconst RECEIVER = 'info@code-specialist.com' // The recipient\nconst SENDER = 'no-reply@code-specialist.com' // The sender (Must be configured with SES)\n\nconst response = {\n  // The response we're going to send to the requester\n  statusCode: 200,\n  body: JSON.stringify('Success')\n}\n\nexports.handler = async function (event) {\n  // The actual lambda\n  console.log('Received event:', event) // To log the event, make sure not to violate applicable data protection directives!\n  const message = await decodeAndTransformContent(event.body) // Decode and transform the form submission\n  await sendEmail(message) // Send the email\n  return response // Return the response\n}\n\nasync function decodeAndTransformContent (eventBody) {\n  const buffer = Buffer.from(eventBody, 'base64') // Create a buffer\n  const content = buffer.toString('ascii') // Decode the base64 encoded form\n  const tuples = content.split('&') // \"a=b&c=d\" => [\"a=b\", \"c=d\"]\n  const kv_pairs = tuples.map(pairs => pairs.split('=')) // [\"a=b\", \"c=d\"] => [[\"a\", \"b\"], [\"c\", \"d\"]]\n  const formatted = kv_pairs.map(pairs => `<b>${pairs[0]}</b>: ${pairs[1]}`) // [[\"a\", \"b\"], [\"c\", \"d\"]] => [\"<b>a</b>: c\", ...]\n  return formatted.join('<br/>') // [\"<b>a</b>: c\", ...] => \"<b>a</b>: b <br/>...\"\n}\n\nasync function sendEmail (message) {\n  const params = {\n    Destination: {\n      ToAddresses: [RECEIVER] // A list of recipients\n    },\n    Message: {\n      Body: {\n        Html: {\n          Data: message // The actual content\n        }\n      },\n      Subject: {\n        Data: 'Contact Form Submission' // Your subject\n      }\n    },\n    Source: SENDER // The sender of the mail (Must be configured with SES)\n  }\n  return ses.sendEmail(params).promise() // Return the sendEmail promise\n}\n```\n\nAll of this code should be self-explanatory. If not, the comments should clarify\nwhat's happening. The serverless function will take any given form event and create a HTML\nmessage body for all the key-value pairs provided.\n\n### Configure the Policy\n\nWhen you created the lambda, a basic policy has been created automatically to\nexecute the lambda. We now have to extend this policy, so it also allows us to\nsend emails via SES.\n\nNavigate to the **IAM** service and then to _Policies_. You should\nfind something named similar to\n`AWSLambdaBasicExecutionRole-5749fdbf-a74e-49a6-a18e-e8dc2d5e7c98`. Click on it\nand then press _Edit policy_. By default, this will open a visual editor.\nClick on the _JSON_ tab instead.\n\nYou should now see the active policy statements in a JSON format:\n\n```JSON\n{\n    \"Version\": \"2012-10-17\",\n    \"Statement\": [\n        {\n            \"Effect\": \"Allow\",\n            \"Action\": \"logs:CreateLogGroup\",\n            \"Resource\": \"arn:aws:logs:eu-central-1:1234567891011:*\"\n        },\n        {\n            \"Effect\": \"Allow\",\n            \"Action\": [\n                \"logs:CreateLogStream\",\n                \"logs:PutLogEvents\"\n            ],\n            \"Resource\": [\n                \"arn:aws:logs:eu-central-1:1234567891011:log-group:/aws/lambda/formFunction:*\"\n            ]\n        }\n    ]\n}\n```\n\nAdd another statement:\n\n```JSON\n...\n    {\n        \"Effect\": \"Allow\",\n        \"Action\": [\n            \"ses:SendEmail\",\n            \"ses:SendRawEmail\"\n        ],\n        \"Resource\": \"*\"\n    }\n...\n```\n\nFinally, click on _Review policy_ and afterward on _Save changes_.\n\n### Create an API Gateway\n\nLast but not least, we need to create an API Gateway to expose the Lambda we\ndefined via a `POST` action. To do so, navigate to the **API Gateway** service.\n\nClick on **Create API** and select **HTTP API**. You can now click on **Add\nintegration** and select your Lambda. Next, choose your API's name and click on\n_Next_. You should now see an UI to configure your routes Select the method\n`POST` for the lambda and choose a resource path for it. The resource path will\nbe the relative address of your endpoint. Leave everything else as it is and\nnavigate via _Next_ until you can click on _Create_.\n\nYou should now see an **Invoke URL** like\n`https://code-specialistxyz.execute-api.eu-central-1.amazonaws.com`, which is the\nbase URL of your API. To call your Lambda you can now execute a post to\n`https://code-specialistxyz.execute-api.eu-central-1.amazonaws.com/contactForm`\nassuming your resource path is `contactForm`.\n\n## Testing the function\n\nTo test your endpoint, you could use this minimal HTML5 snippet:\n\n```html\n<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"utf-8\" />\n    <title>Test Form</title>\n  </head>\n  <body>\n    <!-- Make sure to use your endpoints address below -->\n    <form\n      action=\"https://code-specialistxyz.execute-api.eu-central-1.amazonaws.com/contactForm\"\n      method=\"post\"\n    >\n      <span>Name</span>\n      <input name=\"name\" /><br />\n      <span>Email</span>\n      <input name=\"email\" /><br />\n      <span>Message</span>\n      <input name=\"message\" /><br />\n      <button type=\"submit\">Submit</button>\n    </form>\n  </body>\n</html>\n```\n\nAnd that's basically it. You're ready to go! 🚀\n\nIf anything didn't work as expected or you're in need of an explanation\nsomewhere, don't hesitate to leave us a comment 😊\n",
                                "slug": "form-to-email-aws",
                                "publishDate": "2022-05-25",
                                "excerpt": "Learn how to easily build an endpoint for your forms that triggers an email at nearly zero cost and effort.",
                                "createdAt": "2023-04-10T16:37:54.378Z",
                                "updatedAt": "2023-04-10T16:37:54.378Z",
                                "publishedAt": "2023-04-10T16:37:54.368Z",
                                "author": {
                                    "data": {
                                        "id": 4,
                                        "attributes": {
                                            "name": "Yannic Schröer",
                                            "slug": "yannic",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-05-02T15:39:45.245Z",
                                            "publishedAt": "2023-04-10T16:03:39.313Z",
                                            "image": {
                                                "data": {
                                                    "id": 3,
                                                    "attributes": {
                                                        "name": "Unbenannt.PNG",
                                                        "alternativeText": null,
                                                        "caption": null,
                                                        "width": 879,
                                                        "height": 699,
                                                        "formats": {
                                                            "small": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/small_Unbenannt_bb5374b218.PNG",
                                                                "hash": "small_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "small_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 18.44,
                                                                "width": 500,
                                                                "height": 398
                                                            },
                                                            "medium": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/medium_Unbenannt_bb5374b218.PNG",
                                                                "hash": "medium_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "medium_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 29.78,
                                                                "width": 750,
                                                                "height": 596
                                                            },
                                                            "thumbnail": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/thumbnail_Unbenannt_bb5374b218.PNG",
                                                                "hash": "thumbnail_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "thumbnail_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 7.33,
                                                                "width": 196,
                                                                "height": 156
                                                            }
                                                        },
                                                        "hash": "Unbenannt_bb5374b218",
                                                        "ext": ".PNG",
                                                        "mime": "image/png",
                                                        "size": 6.96,
                                                        "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/Unbenannt_bb5374b218.PNG",
                                                        "previewUrl": null,
                                                        "provider": "aws-s3",
                                                        "provider_metadata": null,
                                                        "createdAt": "2023-04-11T08:44:21.712Z",
                                                        "updatedAt": "2023-05-02T14:58:57.730Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 11,
                            "attributes": {
                                "title": "Availability in Service-Level Agreements (SLA)",
                                "content": "import AvailabilityCalculator from '/src/components/SLACalculator/AvailabilityCalculator.tsx'\n\n## What is an Service Level Agreement?\n\nA **key performance indicator** (KPI) that many cloud service providers and\ncloud product vendors use is **service availability**. It is usually recorded as\n**uptime per year** and defines the **service performance** in a so-called\n**service-level agreement** (SLA) or sometimes also external service agreement.\n\nA service license agreement contains information on a certain level of service\nthat is delivered to a particular customer. Sometimes there are various levels\nof service for different pricing models. SLAs are not static documents and may\nchange over time.\n\nIt's important to note that there are different types of SLAs, they are not\nrestricted to software or services. Also, not all software- or service-related\nSLAs come with an **uptime warranty**.\n\n| Availability | Downtime per year     | Downtime per month    | Downtime per week    |\n| ------------ | --------------------- | --------------------- | -------------------- |\n| 95%          | 18 days 6 hours       | 1 day 7 hours         | 8 hours 25 minutes   |\n| 99%          | 3 days 16 hours       | 7 hours 12 minutes    | 1 hour 41 minutes    |\n| 99.9%        | 8 hours 46 minutes    | 43 minutes 12 seconds | 10 minutes 6 seconds |\n| 99.97%       | 2 hours 38 minutes    | 13 Minutes 8 seconds  | 3 Minutes 2 seconds  |\n| 99.99%       | 52 minutes 34 seconds | 4 minutes 23 seconds  | 1 Minute 1 second    |\n| 99.999%      | 5 minutes 15 seconds  | 26.3 seconds          | 6.1 seconds          |\n| 99.9999%     | 31.5 seconds          | 2.63 seconds          | 0.61 seconds         |\n\nWhy availability is also called the \"**number of nines**\" should be clear after\nchecking the table above.\n\nThese service agreements are not mere lie-documents but define authoritative\n**service standards**. An SLA is a binding contract and a missed KPI is a\ncontract breach. When a service provider is not able to keep up his performance\nstandards they usually compensate customers either in direct refunds or\n**service credits**. How service credits are calculated is also part of Service\nLevel Agreement. Some vendors also describe a right to earn back service\ncredits, when their service performed above the defined goals.\n\nAWS for example states that the service credit percentage for EC2 is 10% between\n99.98 and 99%, 30% between 99% and 95% and 100% for less than 95%. So Amazon\nWebservices will refund 100% of your costs if the service was unavailable for\nmore than 1 day and 7 hours in a specific month.\n\n## Calculating the availability\n\nThere are certain things you should keep in mind when calculating the\navailability of your service:\n\n- The availability of your system is calculated by multiplying the availabilities of all your components \n- Redundancy decreases the fail-rate by one potency (Increases the number of nines by one potency)\n- The availability may not exceed the availability of your most available service\n- Redundancy increases the availability of specific components but may not exceed the availability of the wrapping service \n\n\n## Example with AWS EC2\n\nLet's look at a simple example to shed light on these rather abstract claims.\nAssume you have a service running on AWS EC2. AWS EC2 has an uptime warranty of\n99.99%.\n\nAssuming your service runs smoothly, does not encounter unexpected errors and\nAWS keeps up their promise, the uptime of your service is thereby expected to be\n99,99%.\n\nIf you now want to deliver an uptime that is greater than 99,99% availability,\nthe temptation is great to just spawn another EC2 instance with the same service\nand load balance these. That would result in a fail-rate of 0.0000001%\n\n<math>\nA(Service)=99.99\\%\\\\\\\n\\\\\\\nA(2 * Service) = 1 - (1 - A(Service))^2 = 0.99999999 = 99.999999\\%\n</math>\n\nBut the problem to this calculation is, that the bottleneck here would be\nwrapping service, such as Elastic Load Balancing for example. Elastic load\nbalancing itself has an uptime warranty of 99,99% thus, your service may not\nexceed that value using only EC2 and Elastic Load Balancing.\n\n## Example with self-hosted components\n\nLets assume you have an application consisting of 4 microservices and a database\nrunning on different servers of some random Infrastructure-as-a-Service (IaaS)\nvendor. Your service itself has an availaiblity of 100% the servers offered by\nyour vendor have a uptime warranty of 99.95%. All your services have a simple\nredundancy and are wrapped by a load balancer that comes with 99.99% availability.\n\nYour availaiblity would now be calculated the following way:\n\n<math>\nA(Service)=99.95\\%\\\\\\\nA(Load Balancer)=99.99\\%\\\\\\\n\\\\\\\nA(2 * Service) = 1 - (1 - A(Service))^2 = 0.99900025 \\approx 99.9\\%\\\\\\\nA(All Services) = A(2 * Service)^5 = 0.999^5 = 0.9950099 \\approx 99.5\\%\\\\\\\nA(System) =  min(A(Load Balancer), A(All Services)) \\approx 99.5\\%\n</math>\n\nYour system could possibly provide an uptime warranty of 99.5% which would sum\nup to a maximum downtime of 1 day and 20 hours per year.\n\n## Availability Calculator\n\nI wrote a small calculator that calculates the availability of your system based\non your input. It may not fit all use cases but its easy to get a rough\nunderstanding of how specific components affect the overall availability of your\nsystem.\n\n<AvailabilityCalculator />",
                                "slug": "service-level-agreements-availability",
                                "publishDate": "2022-10-09",
                                "excerpt": "Learn what service level agreements have to do with availability and how it is calculated",
                                "createdAt": "2023-04-10T16:38:31.695Z",
                                "updatedAt": "2023-04-10T16:38:31.695Z",
                                "publishedAt": "2023-04-10T16:38:31.677Z",
                                "author": {
                                    "data": {
                                        "id": 4,
                                        "attributes": {
                                            "name": "Yannic Schröer",
                                            "slug": "yannic",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-05-02T15:39:45.245Z",
                                            "publishedAt": "2023-04-10T16:03:39.313Z",
                                            "image": {
                                                "data": {
                                                    "id": 3,
                                                    "attributes": {
                                                        "name": "Unbenannt.PNG",
                                                        "alternativeText": null,
                                                        "caption": null,
                                                        "width": 879,
                                                        "height": 699,
                                                        "formats": {
                                                            "small": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/small_Unbenannt_bb5374b218.PNG",
                                                                "hash": "small_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "small_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 18.44,
                                                                "width": 500,
                                                                "height": 398
                                                            },
                                                            "medium": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/medium_Unbenannt_bb5374b218.PNG",
                                                                "hash": "medium_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "medium_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 29.78,
                                                                "width": 750,
                                                                "height": 596
                                                            },
                                                            "thumbnail": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/thumbnail_Unbenannt_bb5374b218.PNG",
                                                                "hash": "thumbnail_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "thumbnail_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 7.33,
                                                                "width": 196,
                                                                "height": 156
                                                            }
                                                        },
                                                        "hash": "Unbenannt_bb5374b218",
                                                        "ext": ".PNG",
                                                        "mime": "image/png",
                                                        "size": 6.96,
                                                        "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/Unbenannt_bb5374b218.PNG",
                                                        "previewUrl": null,
                                                        "provider": "aws-s3",
                                                        "provider_metadata": null,
                                                        "createdAt": "2023-04-11T08:44:21.712Z",
                                                        "updatedAt": "2023-05-02T14:58:57.730Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 12,
                            "attributes": {
                                "title": "Kubernetes Cloud Landscapes at Scale with GitOps and Argo CD",
                                "content": "\nToday, software is often shipped as Software as a Service (SaaS) instead of local applications or on-premise hosting. This raises a whole new set of requirements \nand challenges that come with providing the service 24/7. In order to solve these challenges, we typically use hyperscalers like AWS to build and host\ncloud-native applications. The complexity of these cloud landscapes is increasing rapidly, and it is becoming more and more difficult to maintain and operate them.\n\nInfrastructure as Code (IaC) is a great approach to manage cloud landscapes in a declarative, reliable and transparent way. If we think one more step ahead, we don't\nonly want to declare our Infrastructure, we also want to automatically deploy and configure it. Especially for Kubernetes clusters, GitOps is a very powerful approach\nthat combines the power of IaC with the power of Git and Kubernetes operators. In this post, we will take a look at how we can use GitOps to manage cloud landscapes \nat scale and go beyond simple examples.\n\n## What the heck is GitOps?\n\nAlthough this concept is getting more and more popular, it's not yet widely known unfortunately. GitOps is based on IaC, but takes it one step further. We don't just\nhave a declarative description of our infrastructure, we also rely on a version control system like Git. Fairly, besides from GitOps you probably also want to have \nyour IaC configuration in Git, but the purpose there is mainly for versioning and collaboration. \n\nWith GitOps, we also want to use Git as a source of truth for the IaC configuration. Furthermore, that single source of truth is then used to automatically deploy the\nconfiguration to the landscape. This requires the managed infrastructure to be completely projectable via declarative code. Additionally, we need an operator that \nmonitors the state of the Git repository and applies the changes to the infrastructure.\n\n![GitOps Flow](/assets/blog/posts/gitops/gitops-flow.svg)\n\nEspecially with Kubernetes, GitOps can be easily adopted. There are multiple open source tools that can be used to manage Kubernetes clusters with GitOps - the most\ncommon ones are [Argo CD](https://argo-cd.readthedocs.io/en/stable/) and [Flux CD](https://fluxcd.io/). Both tools are very similar in their approach and can be \nused to manage Kubernetes clusters. Since Argo CD provides a great integrated web UI that also visualizes the deployments and sync operations in a very nice way, I\nwill focus on Argo CD in this post.\n\n\n## Git Repository Setup\n\nSo when we want to have all our configuration in Git, how and where is the best place to put it? Some people tend to write Kubernetes configuration directly beneath\nthe source code, but I have a clear answer for that: Throw **everything** into a single\nand separate repository. Even if you have a monorepo for your source code, a clean separation between code and configuration just makes your life easier. There is\na more detailed explanation in the [Argo CD Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/#separating-config-vs-source-code-repositories)\nif you're interested in the benefits.\n\n## Cluster Setup\n\nThe first question to be answered is: How does our cluster setup looks like? The answer heavily depends on the scope of the application and the budget. For small to\nmedium sized landscapes, it is often sufficient to have a single Kubernetes cluster. You can just deploy Argo CD in the same cluster as the deployments it manages - \nlikely in an own namespace. \n\nHowever, for larger landscapes that also must fulfil enterprise compliance requirements, it is often a good idea to have multiple clusters.\nThis allows the separation of different environments physically from each other to have a strict separation of concerns. Also access control is easier to handle\nwhen having multiple clusters, although Kubernetes RBAC is also a very powerful tool to manage access control within one cluster. Additionally, having multiple clusters\nalso enables customers to have a service that is hosted in their region. Especially for enterprise applications that must comply with local data privacy \nrequirements, this can become very important.\n\nNevertheless, whatever landscape setup it is - we can always use Argo CD instance to manage all clusters. In the best case, we have an own cluster that only runs \nArgo CD (and maybe other related components). With having this in place, it's easy to define the requirements for each cluster independently. Although an outage of Argo CD \nis not business-critical (since it only means you cannot update the configuration via Git), it is still a good idea to have an independant high availability setup.\n\n![Cluster Setup](/assets/blog/posts/gitops/cluster-setup.svg)\n\nWe can connect Argo CD with other clusters and also filter the resources by the cluster. That means all the configuration is at one place, we don't have to switch\ntools / instances for different clusters and just have to manage access to one instance. Overall, it reduces the complexity since no direct operation on the\nclusters is required anymore and everything is controlled by a single system.\n\n## Concepts of Argo CD\n\nSo how do we actually configure Argo CD to deploy something? Well, this post is not a hands-on step-by-step guide how to setup Argo CD. If you're looking for that, \njust go to the [documentation](https://argo-cd.readthedocs.io/en/stable/getting_started/) ;). However, I still want to give a brief overview over the concepts Argo CD uses.\n\n![Argo CD Concepts](/assets/blog/posts/gitops/argocd-concepts.svg)\n\n### Applications\n\nAn [application](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#applications) in Argo CD is set of Kubernetes resources that are deployed together. \nThis can be a single deployment, a whole Helm chart or even a whole Git repository.\nNormally, we want to have each component of the service in a separate Argo CD application. This allows having a clear separation of concerns since synchronization and\naccess control happens on application level.\n\n### Application Sets\n\nNow we know what applications are and created ones for all components, great! But what is with multiple environments that have the same components? We don't\nwant to duplicate the configuration for dev, staging, prod, whatever right? This is where [application sets](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/) \ncome into play. An application set is basically a template that dynamically creates applications. In the next chapter, we will take a look at how we can use application\nsets to create applications for multiple environments, maybe even distributed over multiple clusters.\n\n### Projects\n\n[Projects](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#projects) are a virtual grouping of applications that share the same configuration. \nThey configure access, source repositories, clusters, synchronization windows and more for their applications. Each application must belong to a project - there's always\nthe `default` project that can be used when there's no custom one.\n\n## Repository Structure\n\nThe way how we now stucture the configuration in the Git repository is really important and should be well thought out. It's hard to change the structure later on and\nrequires lots of effort, so it's better to find a good setup from the beginning. Unfortunately, I can't give you a one-size-fits-all solution here, but I can explain\nsome approaches that I have seen in the wild and that have their individual benefits.\n\n### Multiple branches\n\nOne approach to handle multiple environments is to have a branch for each environment or cluster. The advantage is, that we can adjust the configuration of each\nenvironment individially, but additionally have the ability to merge configuration between branches. This comes in handy when we make changes first to a \ndevelopment cluster, but then want to ship the exact same config to other environments.\n\nIn Argo CD applications, the branch from the GitOps repository can simply be specified via the `spec.source.targetRevision` property of the `Application` Kubernetes\nresource.\n\nThis might sound really practical at first glance, but in practice the merging between branches can get a bit tedious. Besides possible merge commits, we might not\nwant to merge **all** of the changes, just some of them - and there it starts getting annoying. In practice, this is not always that smooth, that's the reason why\npeople tend to choose other approaches that are explained in the next sections.\n\n### App of Apps\n\nThe \"App of Apps\" concept for Argo CD refers to a way of organizing and managing applications within a Argo CD instance. In this approach, a \"parent\" application is \nused to manage and coordinate the deployment of multiple \"child\" applications, allowing for a more centralized and organized way of managing the applications.\nWe can then manage multiple applications at one place - instead of managing each application seperately.\n\nThat means a file for each application for each environment is required. This approach can be combined with the previous ones, [multiple branches](#mul\nand [Kustomize](#kustomize).\n\n### Application Sets with Matrix Generators\n\nThe App of Apps concept is great, but we still have duplications when having multiple environments since there needs to be an application for each one. \nA solution to reduce boilerplate and duplicated code is to use [Application Sets](https://argo-cd.readthedocs.io/en/stable/user-guide/application-set/). \n\nAn Application Set is an abstraction over applications that allows to dynamically generate applications based on some data. The set has an application template\nthat is parametrizable. Then we need some kind of data source that is used to generate the applications, it can be just hardcoded but also a path to JSON files\nin a git repository.\n\nThis approach assumes that the only diffenrence between the environments is the configuration of the deployments. So when we have Helm charts, we have just \ndifferent `value.yaml` files for each environment. However, this is also the downside of this concept, at least if we replicate environments this way: If we \nchange the Kubernetes configuration, we change it for **all** environments instantly. Changes for _individual_ components can **only** be rolled out by updating the \nrespective `value.yaml` file! If there are frequent changes to the Kubernetes configuration, you might not want to solve the environment replication this way. \n\nA repository using this approach could look like this:\n\n```\napplications/\n    sets/\n        application-set-components.yaml\n    root-deployment.yaml\ncharts/\n    component-a/\n        ...\n    component-b/\nclusters/\n    staging/\n        values/\n            environment.yaml\n            component-a.yaml\n            component-b.yaml\n        config.json\n    production/\n        values/\n            environment.yaml\n            component-a.yaml\n            component-b.yaml\n        config.json\n    ...\n```\n\nThe `root-deployment.yaml` just deploys all Application Sets, it could look like the following example:\n\n```yaml\napiVersion: argoproj.io/v1alpha1\nkind: Application\nmetadata:\n  name: application-sets\n  namespace: argocd\nspec:\n  project: default\n  source:\n    repoURL: git@github.com:code-specialist/gitops.git  # GitOps repository\n    targetRevision: HEAD\n    path: applications/sets\n  destination:\n    # adds app in same cluster that Argo runs in, but sets can still be in other clusters\n    server: https://kubernetes.default.svc\n    namespace: argocd\n```\n\nAn Application Set would then look like this:\n\n```yaml\napiVersion: argoproj.io/v1alpha1\nkind: ApplicationSet\nmetadata:\n  name: components\nspec:\n  generators:\n    - matrix:\n        generators:\n          - git:\n              repoURL: git@github.com:code-specialist/gitops.git  # GitOps repository\n              revision: HEAD\n              files:\n                - path: clusters/*/config.json  # will generate an application for each occurrence / match of this file\n          - list:\n              elements:\n                - component: component-a\n                - component: component-b\n  template:\n    metadata:\n      name: \"{{component}}\"\n      namespace: argocd  # this is just the namespace of the Argo CD application, NOT of the Helm chart\n    spec:\n      project: \"{{cluster.name}}\"  # you can also separate apps in different environments via projects\n      source:\n        path: \"charts/{{component}}\"  # Helm chart directory\n        repoURL: git@github.com:code-specialist/gitops.git  # GitOps repository\n        targetRevision: HEAD\n        helm:\n          valueFiles:\n            - \"../../clusters/{{cluster.name}}/values/environment.yaml\"  # values that are used by whole environment\n            - \"../../clusters/{{cluster.name}}/values/{{component}}.yaml\"  # component-specific values\n      destination:\n        server: \"{{cluster.url}}\"\n        namespace: components  # namespace where the Helm chart is installed\n```\n\nWith this setup, Argo CD will automatically spin up new applications when clusters are added to the `clusters` directory, and also updates the configuration\nwhen value files are updated.\n\n### Kustomize\n\n[Kustomize](https://kustomize.io/) is a tool that allows writing a single \"base\" configuration for the deployments and then overwrite it with customizations\nfor each environment. It is also supported natively by Argo CD, you can find for more information on the corresponding \n[documentation page](https://argo-cd.readthedocs.io/en/stable/user-guide/kustomize/).\n\nThis approach is the most flexible and powerful of the described ones in this post. It allows configuring each environment individially without having to\nduplicate the whole configuration. It requires a bit more boilerplate code than the other ones, but especially in large and complex landscapes this will be \nacceptable. However, you first have to dig a bit into Kustomize to be able to use it properly 😉\n\nA project structure with this approach could look like this:\n\n```\nbase/\n  component-a/\n    kustomize.yaml\n    ...\n  component-b/\n    kustomize.yaml\n    ...\noverlays/\n  staging/\n    kustomize.yaml\n    ...\n  production/\n    kustomize.yaml\n    ...\nkustomize.yaml\n```\n\nWith using Kustomize, we also can also renounce using Helm. Although it is possible to combine both tools, Kustomize in combination with GitOps covers everything\nHelm can do - and even more. The templating is replaced by the overlays and the Helm lifecycle (upates, rollbacks, ...) is covered by GitOps. When we want to rollback\na change, just revert the latest commit!\n\n## Operating the Landscape\n\nSo after we've setup the Argo CD setup and have all clusters connected and runnning, I hope you're starting to see the benefits of GitOps. But after the initial \nsetup, we probably want to go live and have production environments running. This is where the real fun begins.\n\nSo how can we deploy changes in an agile, reliable and smart way? Since we're using Git, we can just create new branches for the changes and open pull requests.\nThis is just awesome, because we can do code reviews and collaborate. But not just that, we can also run pipelines that perform stuff like linting and policy checks.\nFurthermore - and now it gets really fancy - we could deploy the new configuration to a dedicated cluster for pull requests and run automated tests on it. Sure, that\nmeans **a lot** of effort to set this up and maintain this, but for huge enterprise landscapes where lots of engineers from different teams make frequent changes to \nthe infrastructure configuration, this is just gold. On the other side, if that's not the case - just deploy the changes on dev first to verify and test ;)\n\n![Operating productive Environments](/assets/blog/posts/gitops/productive-operations.svg)\n\n## Further Steps\n\nHaven't heard of [CrossPlane](https://www.crossplane.io/) yet? You should definitely have a look! Especially in large infrastructures and enterprises you want to\nautomate as much as possible and have all of the infrastructure as code. This can get quite complex when you have lots of different services, providers and platforms\nas part of the infrastructure. Usually, such configuration is done via [Terraform](https://www.terraform.io/), which is a great tool.\n\nBut what if you can go one step ahead and make it even better? With CrossPlane, you have a Kubernetes control plane that can manage configuration for you. It uses\nthe Kubernetes operator pattern to synchronize the infrastructure with your configuration which you provide via custom Kubernetes resources. And even better - you\ncan combine this with Argo CD and other Tools to also have this configuration as IaC in your GitOps repository!\n\nCrossPlane is open-source and really easy to extend. So if you're interested, I can definitely recommend looking into it 😄\n\n---\n\nWe've reached the end of this post, thanks for reading! If you have any questions, comments or further ideas and tips that can improve GitOps setups, feel free to\npost them in the comments!\n",
                                "slug": "gitops-argocd",
                                "publishDate": "2022-11-19",
                                "excerpt": "Learn how to build and operate complex Kubernetes cloud landscapes at scale with GitOps and Argo CD.",
                                "createdAt": "2023-04-10T16:38:31.706Z",
                                "updatedAt": "2023-04-10T16:38:31.706Z",
                                "publishedAt": "2023-04-10T16:38:31.684Z",
                                "author": {
                                    "data": {
                                        "id": 3,
                                        "attributes": {
                                            "name": "Jonas Scholl",
                                            "slug": "jonas",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-04-10T16:03:39.315Z",
                                            "publishedAt": "2023-04-10T16:03:39.311Z",
                                            "image": {
                                                "data": null
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        },
        {
            "id": 26,
            "attributes": {
                "name": "Architecture",
                "slug": "architecture",
                "hexColor": "#a683fb",
                "createdAt": "2023-04-10T16:14:27.451Z",
                "updatedAt": "2023-04-10T16:14:27.451Z",
                "publishedAt": "2023-04-10T16:14:27.445Z",
                "posts": {
                    "data": [
                        {
                            "id": 10,
                            "attributes": {
                                "title": "The Twelve-Factor App Methodology",
                                "content": "\nThe twelve-factor app methodology goes back to developers at Heroku - One of the\nfirst cloud platforms that ever existed. The methodology consists of best\npractices to build portable, resilient, and scalable web applications and was\npresented by Adam Wiggins in 2011. Some argue that these twelve guidelines are\noutdated and only apply to applications on Heroku. Honestly, eleven years in the\nsoftware industry are a lifetime. But, we do not share this opinion and claim\nthat this methodology is still relevant. The official website emphasizes that\nthe methodology is relevant for developers and operations engineers who develop\nor manage apps or Software-as-a-Service (SaaS). In my opinion, it is also\nrelevant to software architects.\n\n## Twelve-Factor App Methodology Overview\n\n|      |                         |                                                                  |\n| ---- | ----------------------- | ---------------------------------------------------------------- |\n| I    | **Codebase**            | One codebase tracked in revision control, many deploys           |\n| II   | **Dependencies**        | Explicitly declare and isolate dependencies                      |\n| III  | **Config**              | Store config in the environment                                  |\n| IV   | **Backing Services**    | Treat backing services as attached resources                     |\n| V    | **Build, Release, Run** | Strictly separate build and run stages                           |\n| VI   | **Processes**           | Execute the app as one or more stateless processes               |\n| VII  | **Port Binding**        | Export services via port binding                                 |\n| VIII | **Concurrency**         | Scale out via the process model                                  |\n| IX   | **Disposability**       | Maximize robustness with fast startup and graceful shutdown      |\n| X    | **Dev/Prod Parity**     | Keep development, staging, and production as similar as possible |\n| XI   | **Logs**                | Treat logs as event streams                                      |\n| XII  | **Admin Processes**     | Run admin/management tasks as one-off processes                  |\n\nSource: https://12factor.net/. There is also a free e-book available on this topic\nby Adam Wiggins: https://12factor.net/12factor.epub\n\n## I. Codebase\n\nCode is usually tracked in a version control system (VCS) whose state in\nrelation to a specific application is often referred to as a repository. The\nrelation between applications and code bases (aka source control) should be\none-to-one. This has multiple implications:\n\nEach microservice is an app and should fulfil the twelve factors on its own.\nApps may not share code unless the shared code is a dependency. Each \nservice/app should have its own CI/CD pipelines.\n\nFurther a single code base may have multiple deployments. Meaning, regardless of\nthe environment or system, your app always points to the same code base. Though,\nit is possible there are different versions of the same app deployed across\nenvironments. For example, you may deploy `v1.1.0` on your development\nenvironment while your production environment still points to `v1.0.0`.\n\nThis greatly reduces the risk of desynchronization and eases collaboration.\n\n## II. Dependencies\n\nApplications should always explicitly define dependencies and never rely on them\nimplicitly. Also, dependencies should be isolated from the wrapping system to\nprevent leakage. Version mismatches and missing dependencies are one of the most\nannoying issues when setting up applications.\n\nIn the virtualization era, most people instinctively understand that explicit\ndependency definition is crucial. Most languages have very mature package\nmanagers that usually use a dependency declaration file. Dependencies do not\nonly relate to language-specific libraries but also to system tools. (Docker)\nimages for example fail to build if you rely on dependencies that are not\ncontained within your base image.\n\nTip: If you are using Python in your projects and still use plain pip, we would\nlike to encourage you to have a look at [Poetry](https://python-poetry.org/).\n\n## III. Config\n\nConfiguration must be strictly separated from the code and stored centrally.\nInformation such as environment-related addresses, credentials, and settings\nshould be managed via a central configuration file. The configuration itself\nshould be managed by environment variables.\n\n```python title='config.py'\nDATABASE_DRIVER = os.environ.get('DATABASE_DRIVER')\nDATABASE_NAME = os.environ.get('DATABASE_NAME')\nDATABASE_HOST = os.environ.get('DATABASE_HOST')\nDATABASE_PORT = int(os.environ.get('DATABASE_PORT'))\nDATABASE_USERNAME = os.environ.get('DATABASE_USERNAME')\nDATABASE_PASSWORD = os.environ.get('DATABASE_PASSWORD')\nDATABASE_URI = f'{DATABASE_DRIVER}://{DATABASE_USERNAME}:DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}'\n```\n\nThis has a major advantage, wherever your application is deployed,  all you have\nto adjust is the configuration. Many platforms, frameworks, and solutions offer\nexternal configuration management. For example, Kubernetes has configuration\nmaps, docker offers environment variables as `-e` flags and AWS EC2 may be fed\nwith environment variables by using the AWS CLI.\n\n## IV. Backing Services\n\nBacking services are dependencies of the application that are not code but\nconsumable operations. These may be databases, messaging- or queuing services,\nSMTP servers, third-party APIs, or caches like Redis, to name a few. No matter\nif the backing service is a local or remote dependency the application should\ninteract with it in the same way. These dependencies are resources to the\napplication and should be handled as such.\n\n![Backing Services Example](/assets/blog/posts/twelve-factor/backing-services.svg)\n\nThis enables loose coupling by default and thereby grants almost unlimited\nscalability and reliability of both apps and services and also highlights the\nimportance of configuration separation.\n\nTo define these backing services even more explicitly, invert their control,\nmaximize decoupling and ease testing greatly, we suggest you have a look into a\ndependency injection framework in your corresponding language:\n\n- Python dependency injector:https://github.com/ets-labs/python-dependency-injector\n- InversifyJS: https://inversify.io/\n- Java Spring IoC: https://docs.spring.io/spring-framework/docs/3.2.x/spring-framework-reference/html/beans.html\n\n## V. Build, Release, Run\n\nDevOps is all around us. Not much to say for this point. It is recommended to\ntarget fully automated and separated build and run stages. The more of your\nprocesses are automated, the less can go wrong and the more time your save.\n\n## VI. Processes\n\nOne of the major advantages of cloud applications is the ease of\nscaling. But horizontal scaling doesn't come for free. You have to build your applications in\na way they are stateless.\n\nStateless in essence means, that there is no context information saved and each\nrequest is an isolated operation. Concepts like JWT and external caches support us in\nimplementing apps and services in a stateless manner, without losing\nfunctionality or computation speed.\n\nRunning an app as one or multiple stateless processes essentially enables\nelasticity for the specific component.\n\n## VII. Port Binding\n\nThis one aged badly. The initial proposal on this point was that the app should\nbe self-contained and be exposed by being bound to a port. Most of today's\napplications are running on some kind of platform, service, or framework. By\ndefault, many of these require port binding to access the component at all.\n\nOne important note though; This also implies that apps may be backing services\nfor other apps and thereby should be handled as such.\n\n## VIII. Concurrency\n\nThere is a broad variety of concurrency approaches available. Not only across\nlanguages, but also within. Most languages offer a way to scale either by\nspawning multiple (child) processes or by creating threads. Applications should\nbe able to scale out via processes as workloads can become massive and\nincreasing the resources might not work well at a certain point.\n\nIn general, technologies that follow a uber-process approach with threads, tend\nto be more resource intensive as technologies that utilize multiple processes.\nAn example for this is Java that is known for its massive resource consumption.\nThough, this is often a negligible fact, as resources are cheap - Only at\nmassive scale would you notice an impact on your overall costs.\n\n![Rough difference between multithreading and multiprocessing](/assets/blog/posts/twelve-factor/multithread-multiprocessing.svg)\n\n## IX. Disposability\n\nDisposability means that twelve-factor apps can be started and stopped at a\nmoments notice. This enables fast and elastic scaling as well as rapid\ndeployment of code and configuration changes. Apps should also shut down\ngracefully to handle crashes and scale in scenarios. Containers and functions\nalmost always fulfil this requirement by default.\n\nServerless functions are a great example of how this concept may be used to\ndrastically reduce development effort and costs. Many cloud offerings include\nserverless functions, such as AWS Lambda, Azure Functions, Cloud Functions on\nGoogle Cloud Platform (GCP) or even Vercel Serverless Functions.\n\n## X. Dev/Prod Parity\n\nEnvironments should be as similar as possible. In fact, all that should be\ndifferent across your development, staging and production environments should be\nconfiguration. This is a crucial concept to implement continuous delivery and\ncontinuous deployments without encountering massive problems.\n\n## XI. Logs\n\nLogging is an often underrated task. Though, besides actual code, logging is the\nmost important task in distributed systems. Not implementing logging (correctly)\nmeans you're flying blind. Nobody can maintain and debug such complex systems\nwithout proper logging. Not being able to identify bugs in a production\nenvironment can be frustrating, given the fact, you should never directly debug\na productive app, but only evaluate its logs.\n\nThese logs should be handled as streams and never be the concern of the app\nitself. Instead, applications should write to `stdout` and then either be\nhandled by a terminal (locally) or a log-streaming/aggregation solution\n(deployed). Meaning the logging aspect should be decoupled from the application\nand be handled by the wrapping context.\n\nTo increase the readability and the capabilities to search and filter your logs,\nyou might want to have a look at a structured logging solution.\n\n## XII. Admin Processes\n\nThere are often tasks that a developer or operator would like to see fulfilled.\nThese could be database migrations, synchronization jobs, or event-related\ntasks. These should be executable as short-lived processes. An example of this\ncould be images that may be started with flags, cron-jobs, or serverless\nfunctions.\n\n## Summary\n\nEven though this list isn't complete and some principles seem a bit outdate,\nthese twelve-factor principles are far from being irrelevant. Most of the points\nare still highly applicable and should be understood and memorized by any\nprofessional working in the software industry.\n\nIf you have additions or are not of our opinion, please let us know in the\ncomments to improve this wrap-up of the twelve-factor methodology.\n",
                                "slug": "twelve-factor-app-methodology",
                                "publishDate": "2022-10-08",
                                "excerpt": "Some might argue that the twelve-factor principles are dusty and oudated. But they are far from that. The principles are still applicable to almost any (cloud native) application and are contain generally good advices",
                                "createdAt": "2023-04-10T16:38:20.499Z",
                                "updatedAt": "2023-04-10T16:38:20.499Z",
                                "publishedAt": "2023-04-10T16:38:20.495Z",
                                "author": {
                                    "data": {
                                        "id": 4,
                                        "attributes": {
                                            "name": "Yannic Schröer",
                                            "slug": "yannic",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-05-02T15:39:45.245Z",
                                            "publishedAt": "2023-04-10T16:03:39.313Z",
                                            "image": {
                                                "data": {
                                                    "id": 3,
                                                    "attributes": {
                                                        "name": "Unbenannt.PNG",
                                                        "alternativeText": null,
                                                        "caption": null,
                                                        "width": 879,
                                                        "height": 699,
                                                        "formats": {
                                                            "small": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/small_Unbenannt_bb5374b218.PNG",
                                                                "hash": "small_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "small_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 18.44,
                                                                "width": 500,
                                                                "height": 398
                                                            },
                                                            "medium": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/medium_Unbenannt_bb5374b218.PNG",
                                                                "hash": "medium_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "medium_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 29.78,
                                                                "width": 750,
                                                                "height": 596
                                                            },
                                                            "thumbnail": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/thumbnail_Unbenannt_bb5374b218.PNG",
                                                                "hash": "thumbnail_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "thumbnail_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 7.33,
                                                                "width": 196,
                                                                "height": 156
                                                            }
                                                        },
                                                        "hash": "Unbenannt_bb5374b218",
                                                        "ext": ".PNG",
                                                        "mime": "image/png",
                                                        "size": 6.96,
                                                        "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/Unbenannt_bb5374b218.PNG",
                                                        "previewUrl": null,
                                                        "provider": "aws-s3",
                                                        "provider_metadata": null,
                                                        "createdAt": "2023-04-11T08:44:21.712Z",
                                                        "updatedAt": "2023-05-02T14:58:57.730Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 13,
                            "attributes": {
                                "title": "Hyrum's Law of Implicit Dependencies",
                                "content": "\nHyrum Wright is a Staff Software Engineer at Google, according to his [LinkedIn profile](https://www.linkedin.com/in/hyrum-wright-0905427/). He made an observation nowadays\ncalled \"**Hyrum's Law**\". It regards interfaces and API design and should be considered and memorized by anyone employed in the **software engineering** sector.\n\n## Hyrum's Law\n\n> With a sufficient number of users of an API, it does no matter what you promise in the contract: all observable behaviors of your system will be dependend on by somebody.\n>\n> Hyrum Wright on [https://www.hyrumslaw.com/](https://www.hyrumslaw.com/) - popularized by Google Employees and Titus Winters\n\n## Definitions\n\nTo fully understand the impact of this sentence, we have to define a few things:\n\n- **_API_** \\- Any occurrence of an interface\n- _**Interface** \\-_ Not the concrete code pattern such as in Java, for example, but the abstract concept that defines the exposure of any consumable functions\n\n## Significance and Meaning\n\nHyrum himself called this observation \"**The Law of Implicit Dependencies**\". But people at Google spread the name \"Hyrum's **Law**\" for the apparent reason of briefness. However,\nthat's also why nobody not knowing about it will understand what's meant.\n\nA colloquial interpretation of this law could be: \"Every change breaks someone's workflow\", as ridiculously shown in a comic on [https://xkcd.com/1172/](https://xkcd.com/1172/).\nBut to understand that, we have to take a step back and look at the big picture: Anyone exposing his code as (re)usable functions inside a project, or for example, as a RESTful\nAPIs outside the project, usually does that for the sake of people to explicitly use the code. However, by the laws of statistics, all the observable behaviors your code supplies\nwill eventually be used by someone, thereby implicitly assuming things.\n\n## Example\n\nTo [grasp](https://code-specialist.com/code-principles/grasp/) what these abstract sentences actually mean, take this example: You build an API that publicly delivers cat facts:\n\n```json\n{\n  \"catfacts\": [\n    \"fact\"\n    :\n    {\n      \"number\": 1,\n      \"text\": \"Cats have 230 bones while humans only have 206.\"\n    },\n    \"fact\"\n    :\n    {\n      \"number\": 2,\n      \"text\": \"Cats live longer if they live indoor.\"\n    }\n  ]\n}\n```\n\nGiven this information, people will implicitly assume that this interface serves cat facts in ascending order regarding their number. Meaning if the API delivers these facts in a\nrandom order, it will break someone's system at some point if they, for example, always ship the first fact as the latest one. Or even less obvious: the API orders the items\nconcerning their first digit of the number.\n\n```json\n{\n  \"catfacts\": [\n    \"fact\"\n    :\n    {\n      \"number\": 1,\n      \"text\": \"Cats have 230 bones while humans only have 206.\"\n    },\n    \"fact\"\n    :\n    {\n      \"number\": 10,\n      \"text\": \"Abraham Lincoln had 4 cats that lived in the white house with him\"\n    },\n    \"fact\"\n    :\n    {\n      \"number\": 2,\n      \"text\": \"Cats live longer if they live indoor.\"\n    },\n    ...\n  ]\n}\n```\n\nThis will also lead to a system or workflow breaking at some point. And it may be unfathomable to its maintainers why that is. The same applies to explicit changes, such as\nintroducing a new ORM on the backend side that leads to the items being delivered in the inverted order. Funny things can happen now if people try to fix this naively.\n\n## Consequences of Hyrum's Law\n\nThe problem should be apparent by now. But what are the implications for software engineers, teams, and consumers?\n\nThe most straightforward answer could be: \"Don't change anything\". But that's ridiculous again. Anyone working in the computer science industry will confirm that \"nothing is as\nconstant as change\", and change is, in fact, a good thing, as it's the foundation of any improvement and innovation.\n\nThe uncomfortable answer is: we have to take this into account and mind as a software engineer and a consumer of these APIs.\n\n- As the developer, we should **provide as much information explicitly** as possible, most likely in the documentation. This will reduce the number of people that make implicit\n  assumptions about the API\n- As the consumer, we should **assume as little as possible about APIs** we consume. Of course, there will still be assumptions made, but if you keep in mind that they are\n  assumptions, you may save hours debugging your code.\n- As a software architect, we should **plan APIs thoroughly to minimize behavioural changes**. New behaviour should belong to new endpoints.\n\n## TLDR;\n\n- **Hyrum's law** basically means: Whatever you deliver, someone is going to use it in a way you never imagined\n- Change is necessary and will eventually break someone's system\n- Give more explicit information on your interface to reduce the number of implicit assumptions\n- Make fewer assumptions about code and, if applicable, test its behavior\n",
                                "slug": "hyrums-law",
                                "publishDate": "2021-09-30",
                                "excerpt": "If Hyrum’s Law would be a movie I would describe it as: The consequences of bad documentation and assumptions on interfaces.",
                                "createdAt": "2023-04-10T16:38:31.714Z",
                                "updatedAt": "2023-04-10T16:38:31.714Z",
                                "publishedAt": "2023-04-10T16:38:31.704Z",
                                "author": {
                                    "data": {
                                        "id": 4,
                                        "attributes": {
                                            "name": "Yannic Schröer",
                                            "slug": "yannic",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-05-02T15:39:45.245Z",
                                            "publishedAt": "2023-04-10T16:03:39.313Z",
                                            "image": {
                                                "data": {
                                                    "id": 3,
                                                    "attributes": {
                                                        "name": "Unbenannt.PNG",
                                                        "alternativeText": null,
                                                        "caption": null,
                                                        "width": 879,
                                                        "height": 699,
                                                        "formats": {
                                                            "small": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/small_Unbenannt_bb5374b218.PNG",
                                                                "hash": "small_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "small_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 18.44,
                                                                "width": 500,
                                                                "height": 398
                                                            },
                                                            "medium": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/medium_Unbenannt_bb5374b218.PNG",
                                                                "hash": "medium_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "medium_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 29.78,
                                                                "width": 750,
                                                                "height": 596
                                                            },
                                                            "thumbnail": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/thumbnail_Unbenannt_bb5374b218.PNG",
                                                                "hash": "thumbnail_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "thumbnail_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 7.33,
                                                                "width": 196,
                                                                "height": 156
                                                            }
                                                        },
                                                        "hash": "Unbenannt_bb5374b218",
                                                        "ext": ".PNG",
                                                        "mime": "image/png",
                                                        "size": 6.96,
                                                        "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/Unbenannt_bb5374b218.PNG",
                                                        "previewUrl": null,
                                                        "provider": "aws-s3",
                                                        "provider_metadata": null,
                                                        "createdAt": "2023-04-11T08:44:21.712Z",
                                                        "updatedAt": "2023-05-02T14:58:57.730Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        },
        {
            "id": 27,
            "attributes": {
                "name": "Python",
                "slug": "python",
                "hexColor": "#241def",
                "createdAt": "2023-04-10T16:14:27.458Z",
                "updatedAt": "2023-04-10T16:14:27.458Z",
                "publishedAt": "2023-04-10T16:14:27.453Z",
                "posts": {
                    "data": [
                        {
                            "id": 7,
                            "attributes": {
                                "title": "Python Switch-Statement Alternative",
                                "content": "\nA switch-case statement is smarter than writing lots of large if-statements instead, \nso does Python wants us to mess up our code with the worse alternative?\n\nDefinitely not! Despite the fact that switch-statements are indicators for \n**[code smell](https://t2informatik.de/wissen-kompakt/code-smell/)** and you should \nbe careful of using them anyway, there is a clever way to make up for the lack of \nswitch statements in Python!\n\n**Disclaimer**: Python 3.10 introduced [structural pattern matching](https://peps.python.org/pep-0636/)\nwhich might also be an alternative for the switch statement depending on the \nuse-case. However, this post is focussed on an alternative that works with \nall versions of Python 3, if you want a dedicated post for the new pattern \nmatching please let me know in the comments!\n\n## What is the Switch-Statement?\n\nThe switch statement is a control flow for comparing a value with multiple variants. \nIn general, this is just syntactic sugar for a large if-statement. The syntax may\nlook like this:\n\n```JavaScript\nswitch (x) {\n  case 'variant1':\n    // do something here if x == 'variant1'\n    break;\n  case 'variant2':\n    // do something here if x == 'variant2'\n  default:\n    // do something here if no case matched\n    // or no break statement jumped out of the switch before\n}\n```\n\nThis syntax applies to nearly all common programming languages which support the \nswitch-statement, like Java, JavaScript, or C for instance. Note that you have to use \na _break_ if you want the program to leave the switch statement after a case matched! \nOtherwise, the program will continue running the instructions for the next case, without \nchecking if the case actually matches.\n\n## The Code Smell of Switch-Statements\n\nThe previous explanation already showed one of the most common pitfalls with switch \nstatements: The syntax can easily lead to unintended bugs when you mess something up \nwith the break-statements.\n\nBesides that, you can do **anything** within the body of a case. That means every case \ncan have a different behavior which may be really unintentional. For instance, you can \nstop a loop in the above statements or return something and exit the current function. \nThis can get really messy when your project grows!\n\nAdditionally, the switch-statement is not optimal for code that is supposed to get extended \nin the future. Every time you want to add a case, you have to modify the statement. Depending \non the language you are using, you maybe need to redeploy the whole application every time \nyou want to add some functionality. This clearly violates the \n[Open-Closed Principle](https://code-specialist.com/code-principles/ocp-principle/)!\n\n## Alternative in Python\n\nIf you want to check a value for many possibilities, you clearly want something like the \nswitch-statement. The worst thing you can do is to solve the problem with tons of if-statements \nthat pollute your code – you should never do that! But the good thing is: There's a smart \npythonic approach to compensate for the switch-statement!\n\nIn general, the pattern is based on the enormous power of dictionaries in Python. As an example, \nwe take a look into a simple command-line game. The game will just ask you for a decision at \neach step. In this context, the dictionary mapping gives you the power to do something like this:\n\n```python\ndirection_messages = {\n    \"north\": \"You freeze to death\",\n    \"east\": \"You die in the desert after 42 days of suffering\",\n    \"south\": \"You win the Superbowl!\",\n    \"west\": \"You fall into a gigantic ravine and die instantly\",\n}\n\ndirection = input(\"where do you want to go? \")\nmessage = direction_messages.get(\n    direction.strip().lower(), \n    \"You have to give a compass direction\"\n)\nprint(message)\n```\n\nIn this example, the value for which we check the cases is the user's input and the cases are \nrepresented as keys of the dictionary. Note that do the dictionary lookup with the **get()** \nfunction, which every dictionary provides. The advantage is, that you can specify a default \nvalue with the second parameter. This corresponds to the default case of the switch statement \nand we don't have to catch a KeyError, in case the user gives an invalid answer.\n\n## Adding functionality to the cases\n\nOkay, this covers basically the functionality of a switch-statement, but we only have strings \nas values. Indeed, the switch-statement allows you to run any code you want for a case. To \nachieve this, we can use a **dictionary of functions**. At first, this may seem a bit strange, \nbut we can use function objects as dictionary values too! With this technique, we can create a \nmapping for functions that define the blocks of code for each case.\n\nBut first, let me start with the easiest version: **lambda functions**. They are simply \nsingle-expression and anonymous functions. They take as many arguments as you want, but can only \nexecute one expression and return its result. A simple example for using lambdas in this context \nwould be a basic calculator:\n\n```python\noperations = {\n    \"+\": lambda x, y: x + y,\n    \"-\": lambda x, y: x - y,\n    \"*\": lambda x, y: x * y,\n    \"/\": lambda x, y: x / y,\n}\n\noperation = input(\"Which operation should I execute? \")\noperation_function = operations.get(\n    operation,\n    lambda x, y: \"unsupported operation\"\n)\n\nnumbers = input(\"Numbers for the calculation: \")\nnumbers_list = numbers.split(' ')\nresult = operation_function(*list(map(int, numbers_list)))\nprint(f\"Result: {result}\")\n```\n\nAlthough this is just a very basic and a little bit ugly calculator you can do much better for \nsure, it shows how you can use lambdas for simple operations. This time, we get a callable object \ninstead of a string from the dictionary. This callable is stored in a variable, which we can call \nwith the numbers the user gives the calculator.\n\n## We can use functions too!\n\nThough the lambdas can be really useful, in most cases you want to do more than one expression. \nSure, you can call a function in a lambda expression – but you can also replace the lambda with \na function right away. Then you have a function for every case, where you can do everything you \nwant. Now we want to expand our little command-line game from before.\n\n```python\ndef player_goes_north():\n    pass  # do here whatever you want\n\ndef player_goes_east():\n    pass  # do here whatever you want\n\ndef player_goes_south():\n    pass  # do here whatever you want\n\ndef player_goes_west():\n    pass  # do here whatever you want\n\ndef unknown_direction():\n    print(\"You have to enter a compass direction!\")\n\ndirection_messages = {\n    \"north\": player_goes_north,\n    \"east\": player_goes_east,\n    \"south\": player_goes_south,\n    \"west\": player_goes_west,\n}\n\ndirection = input(\"where do you want to go? \")\nperform_player_action = direction_messages.get(\n    direction.strip().lower(),\n    unknown_direction\n)\nperform_player_action()\n```\n\nNow we can do anything we want for each way the player wants to go. It works the same way as before, \nwe just replaced the lambdas with normal functions.\n\nA common pitfall, especially when one isn't familiar with the concept of functions as objects, might \nbe to put parentheses behind the function names in the dictionary. Make sure to only have the name \nin there. You don't want to call the function, you only want the function **object** stored in the \ndictionary.\n\nThere are a few more possibilities to use dictionaries with functions, but these are the basic ones \nthat should suffice most of the time. Finally, I want to point out the fact that you can use \n**any mutable object** as a key in dictionaries, not only strings like in the previous examples. \nYou can even use data-types for it and much more! So you have great opportunities to take advantage \nof this pattern!\n\n## Conclusion\n\nIn Python, you can easily create a good alternative for the switch-statement in a really pythonic \nway. I personally think that this way is even better than the switch, it has almost none of its \ndisadvantages.\n\nAlthough, there is even another approach. There is an object-oriented alternative that uses \n**polymorphism** to get rid of the switch-statement. This pattern is particularly common in other \nlanguages where you cannot use the pythonic approach. If you're interested in this alternative or \nhave questions about this topic, leave a comment and I do my best to explain it!\n",
                                "slug": "python-switch-statement-alternative",
                                "publishDate": "2020-10-25",
                                "excerpt": "Most common programming languages feature the switch-case statement, while Python doesn't. Although Python3.10 introduced structural pattern matching, there are other smart alternatives you should be aware of!",
                                "createdAt": "2023-04-10T16:37:54.380Z",
                                "updatedAt": "2023-04-10T16:37:54.380Z",
                                "publishedAt": "2023-04-10T16:37:54.364Z",
                                "author": {
                                    "data": {
                                        "id": 3,
                                        "attributes": {
                                            "name": "Jonas Scholl",
                                            "slug": "jonas",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-04-10T16:03:39.315Z",
                                            "publishedAt": "2023-04-10T16:03:39.311Z",
                                            "image": {
                                                "data": null
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 14,
                            "attributes": {
                                "title": "Midpoint Line Algorithm",
                                "content": "\n## Overview\n\nThe Midpoint Line Algorithm is based on the Bresenham algorithm and is not a\ngeneral approach, but a solution for screening lines between a slope of 0 and 1\n(0 - 45°). If you draw a line in computer graphics, you are limited to the\namount of pixel you can use. For example, a simple line could be realized in\nseveral different pixel arrangements\n\n### Original Representation\n\n![Original representation](/assets/blog/posts/midpoint-line/midpoint-line-original.svg)\n\n### Interpretation\n\n![Pixel interpretation\n  1](/assets/blog/posts/midpoint-line/midpoint-line-interpretation-1.svg)\n\n### Another interpretation\n\n![Pixel interpretation\n  2](/assets/blog/posts/midpoint-line/midpoint-line-interpretation-2.svg)\n\nAnd these are just two of many possible solutions of creating the line.\n\nSo, besides the problem that we usually can't solve algorithmic problems\ngraphically, we need a rule that tells us which pixels should be drawn and which\nnot. The midpoint line algorithm does this in two steps:\n\n1. Calculate the mid of two given pixels\n2. Evaluate if the line that should be drawn is below or above that mid\n   - If the line crosses above the mid the northeast (NE) pixel of the midpoint\n     will be inked\n   - if the line crosses below the mid, the east (E) pixel of the midpoint will\n     be inked\n\n![Midpoint Line Algorithm\nexample](/assets/blog/posts/midpoint-line/midpoint-line-cropped.svg)\n\nAs you see in this example, the mid between `A (3 | 1)` and `B (3 | 2)` is `M (3 | 1.5)`. And the line we want to draw crosses above this midpoint. Thereby we\ncan ink the pixel **north-east** of the midpoint.\n\n## Mathematical basics\n\nAs you now should understand the problem and the suggested solution, we jump\nright into the mathematical basics for implementing this algorithm. This section\nshould cover anything new for you; it's merely a reminder and a mutual\ndefinition of terms.\n\n### Linear function\n\n<math>f(x) = y = mx+b</math>\n\nWhereas `x` and `y` are the corresponding `x` and `y`\\-coordinates in our\neuclidean grid, `m` is our slope coefficient, and `b` our y-intercept.\n\n### Slope Coefficient\n\nNext we need a way to calculate the `slope coefficient m` we achieve that\nby:\n\n<math>\n  m=\\frac{'{'}\\Delta y{'}'}\n  {'{'}\\Delta x{'}'}\n</math>\n\nWhereas `Δy` describes the `y-difference` and `Δx` the `x-difference`.\n\nGiven these basics, we may now determine the linear function for the given\nexample. As we want to draw the line between `A (1 | 1)` and `B (9 | 4)`, we the\nfollowing slope coefficient:\n\n<math>\n  m = \\frac{'{'}4-1{'}'}\n  {'{'}9-1{'}'}=\\frac{'{'}3{'}'}\n  {'{'}8{'}'}\n</math>\n\nThis alters our original definition of the linear function:\n\n<math>\n  f(x) = y=\\frac{'{'}\\Delta y{'}'}\n  {'{'}\\Delta x{'}'}x+b\n</math>\n\n### y-Intercept\n\nTo calculate the `y-intercept`, we need to rearrange the equation to `b` and\ninsert any point on the line.\n\n<math>y=mx+b \\\\ b=y-mx</math>\n\nUsing the `start point (1 | 1)` we get `b = 5/8`:\n\n<math>\n  b=1-\\frac{'{'}3{'}'}\n  {'{'}8{'}'}*1 =\\frac{'{'}5{'}'}\n  {'{'}8{'}'}\n</math>\n\nWhich finally, leads us to the linear function of\n\n<math>\n  f(x) =\\frac{'{'}3{'}'}\n  {'{'}8{'}'}*x+\\frac{'{'}5{'}'}\n  {'{'}8{'}'}\n</math>\n\nfor our specific example.\n\n### Calculating the Midpoint\n\nTo calculate the midpoint of two points in a vertical line in the grid, we take\ntheir x value (both points got the same value for x) and calculate the y value\nby calculating their mean value.\n\nGiven these conventions, we may calculate the midpoint of given coordinates `A = (x | y)` and `B = (x | y+1)` by:\n\n<math>\n  F(M) = ( x_A | \\frac{'{'}y_A+y_B{'}'}\n  {'{'}2{'}'} )\n</math>\n\nAs the `y-difference` between these two points always is `1`, the formula can\nfurther be simplified as:\n\n<math>\n  F(M) = ( x_A | \\frac{'{'}y_A+y_B{'}'}\n  {'{'}2{'}'} ) = ( x_A | y_A + \\frac{'{'}1{'}'}\n  {'{'}2{'}'} )\n</math>\n\n### Determining a Midpoints Relative Position\n\nAll that is left now is to evaluate either a given line crosses above or below\nthe calculated midpoint. To do so, we need the `y-difference` between the\n`midpoint` and the line at specific `x-coordinates`.\n\nThis, in turn, can be achieved by merely calculating the difference between the\n`y-value` of the midpoint and the `y-value` of the line. To ease things further,\nwe take the linear function and rewrite it to the implicit form:\n\n<math>f(x, y) = \\Delta y*x - \\Delta x * y + b*\\Delta x</math>\n\nFor each point that belongs to our original linear function\n\n<math>\n  f(x) =\\frac{'{'}3{'}'}\n  {'{'}8{'}'}*x+\\frac{'{'}5{'}'}\n  {'{'}8{'}'}\n</math>\n\nThis formula will return `0`. For each point below our line, the function will\nreturn a **positive value,** and for each point above the line, the function\nwill return a **negative value**. So we can easily evaluate if a calculated\nmidpoint is:\n\n1. above the line → the line crosses below the midpoint and `E` will be inked\n2. below the line → the line crosses above the midpoint and `NE` will be inked\n\nBy convention, we call the return value of our function `f(x,y)` the **decision\nparameter** `d` as it decides which pixel will be inked. To make things even\nclearer we can fill in the values we already know into the abstract function:\n\n<math>\n  \\Delta x = 8 \\\\ \\Delta y = 3 \\\\ b=\\frac{'{'}5{'}'}\n  {'{'}8{'}'}\n</math>\n\n<math>f(x_i, y_i) = 3x_i - 8y_i + \\frac{'{'}5{'}'}{'{'}8{'}'}*8 = f(x_i, y_i) = 3x_i - 8y_i + 5</math>\n\n`xi` and `yi` are specific values, whereas `Δx` and `Δy` belong to the original\nfunction. So if we test this for a point `A = (1, 1)` on the line, we get:\n\n<math>f(1, 1) = 3*1 - 8*1 + 5 = 0</math>\n\n## Formulate the Algorithm\n\nGiven you understood the mathematical basics, you should now be able to\nformulate an algorithmic approach to solve the problem of drawing pixels.\n\nTo ease things, I will start by defining simple classes that describe points and\nlinear functions in the scope we require.\n\n```python\nclass Point:\n\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def get_midpoint(self):\n        return Point(self.x, self.y + 0.5)\n    \n    def __repr__(self):\n        return f'({self.x} | {self.y})'\n```\n\nAs you can see, I implemented a method `get_midpoint()` that returns the midpoint of the current coordinates and the same point in which the `y-coordinate`has been incremented by `1`. And a`repr-function` that alters the way the object is\nreturned as a string.\n\n```python\nclass LinearFunction:\n\n    def __init__(self, start: Point, end: Point):\n        self.start = start\n        self.end = end\n        self.delta_y = point_b.y - point_a.y\n        self.delta_x = point_b.x - point_a.x\n        self.b = self._calculate_b()\n\n    def _calculate_b(self):\n        return self.start.y - self.delta_y / self.delta_x * self.start.x\n\n    def point_is_below(self, point: Point):\n        return 0 > self.delta_y * point.x - self.delta_x * point.y + self.b * self.delta_x\n```\n\nThe LinearFunction class got a pseudo-private method `_calculate_b()` that\ncalculates the `y-intercept`. If you read our meaningful names article, you\nmight protest now that calculate`y_intercept()` might be a better name. And this\nis indeed a point; the name might be useless to someone defining linear\nfunctions with different variable names. However, next, we got a function\npoint `is_below()` that implements the part from the implicit form of the\n\"Determining a Midpoints Relative Position\"-section. It returns True if a given\npoint is below the line that is created by its function. And that's it. That's\nall we need to run the algorithm. Let's bring all this together with a\n`MidpointLineAlgorithm`-class.\n\n```python\nclass MidpointLineAlgorithm:\n\n    def __init__(self, linear_function: LinearFunction):\n        self.linear_function = linear_function\n\n    def run(self):\n        points = list()\n\n        iterations = linear_function.delta_x\n        y = linear_function.start.y\n        x = linear_function.start.x\n\n        for x_i in range(iterations):\n            current_point = Point(x + x_i, y)\n            current_mid_point = current_point.get_midpoint()\n\n            if linear_function.point_is_below(current_mid_point):\n                points.append((current_point, \"East\"))\n\n            else:\n                points.append((current_point, \"Northeast\"))\n                y += 1\n\n        return points\n```\n\nThe Algorithm is initialized with a linear function. The number of iterations we\nneed corresponds to the number of steps we can do or simply `Δx` of our linear\nfunction. Additionally, we need a starting point; we simply choose the first\npoint (`(1 | 1)` in our specific case).\n\nThe point of interest is in each step defined by the initial `x-value` and the\ncurrent iteration `(x + xi),` and the current `y`. Here's the only new thing:\neach time the algorithm decides we go northeast, we have to increment `y` as it\nonly increases if we switch lines. So y is determined by the initial `y` plus\nthe times we went northeast.\n\nThe full code for our specific example looks the following:\n\n```python\nclass Point:\n\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def get_midpoint(self):\n        return Point(self.x, self.y + 0.5)\n\n    def __repr__(self):\n        return f'({self.x} | {self.y})'\n\n\nclass LinearFunction:\n\n    def __init__(self, start: Point, end: Point):\n        self.start = start\n        self.end = end\n        self.delta_y = point_b.y - point_a.y\n        self.delta_x = point_b.x - point_a.x\n        self.b = self._calculate_b()\n\n    def _calculate_b(self):\n        return self.start.y - self.delta_y / self.delta_x * self.start.x\n\n    def point_is_below(self, point: Point):\n        return 0 > self.delta_y * point.x - self.delta_x * point.y + self.b * self.delta_x\n\n\nclass MidpointLineAlgorithm:\n\n    def __init__(self, linear_function: LinearFunction):\n        self.linear_function = linear_function\n\n    def run(self):\n        points = list()\n\n        iterations = linear_function.delta_x\n        y = linear_function.start.y\n        x = linear_function.start.x\n\n        for x_i in range(iterations):\n            current_point = Point(x + x_i, y)\n            current_mid_point = current_point.get_midpoint()\n\n            if linear_function.point_is_below(current_mid_point):\n                points.append((current_point, \"East\"))\n\n            else:\n                points.append((current_point, \"Northeast\"))\n                y += 1\n\n        return points\n\n\nif __name__ == \"__main__\":\n    point_a = Point(1, 1)\n    point_b = Point(9, 4)\n    linear_function = LinearFunction(start=point_a, end=point_b)\n\n    midpoint_line_algorithm = MidpointLineAlgorithm(linear_function=linear_function)\n\n    points = midpoint_line_algorithm.run()\n\n    print(points)\n```\n\nIf you run the code it will output the following:\n\n```python\n[\n  ((1 | 1), 'East'),\n  ((2 | 1), 'East'),\n  ((3 | 1), 'Northeast'),\n  ((4 | 2), 'East'),\n  ((5 | 2), 'Northeast'),\n  ((6 | 3), 'East'),\n  ((7 | 3), 'East'),\n  ((8 | 3), 'Northeast')\n]\n```\n\nWhich corresponds to the following picture:\n\n![Midpoint line algorithm in\naction](/assets/blog/posts/midpoint-line/midpoint-line-result.svg)\n\n## Summary\n\nI hope you could grasp the functionality of the midpoint line algorithm and\nunderstood why and how the mathematical concepts are used to let it work\nproperly. If there is anything left unclear, please don't hesitate to comment,\nand I will try to come back to you or adjust the post as soon as possible. Happy\ncoding!\n",
                                "slug": "midpint-line",
                                "publishDate": "2020-12-01",
                                "excerpt": "The midpoint line algorithm is a drawing algorithm in the field of computer graphics. It is used to determine how lines are translated into pixels.",
                                "createdAt": "2023-04-10T16:38:31.729Z",
                                "updatedAt": "2023-04-10T16:38:31.729Z",
                                "publishedAt": "2023-04-10T16:38:31.717Z",
                                "author": {
                                    "data": {
                                        "id": 4,
                                        "attributes": {
                                            "name": "Yannic Schröer",
                                            "slug": "yannic",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-05-02T15:39:45.245Z",
                                            "publishedAt": "2023-04-10T16:03:39.313Z",
                                            "image": {
                                                "data": {
                                                    "id": 3,
                                                    "attributes": {
                                                        "name": "Unbenannt.PNG",
                                                        "alternativeText": null,
                                                        "caption": null,
                                                        "width": 879,
                                                        "height": 699,
                                                        "formats": {
                                                            "small": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/small_Unbenannt_bb5374b218.PNG",
                                                                "hash": "small_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "small_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 18.44,
                                                                "width": 500,
                                                                "height": 398
                                                            },
                                                            "medium": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/medium_Unbenannt_bb5374b218.PNG",
                                                                "hash": "medium_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "medium_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 29.78,
                                                                "width": 750,
                                                                "height": 596
                                                            },
                                                            "thumbnail": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/thumbnail_Unbenannt_bb5374b218.PNG",
                                                                "hash": "thumbnail_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "thumbnail_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 7.33,
                                                                "width": 196,
                                                                "height": 156
                                                            }
                                                        },
                                                        "hash": "Unbenannt_bb5374b218",
                                                        "ext": ".PNG",
                                                        "mime": "image/png",
                                                        "size": 6.96,
                                                        "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/Unbenannt_bb5374b218.PNG",
                                                        "previewUrl": null,
                                                        "provider": "aws-s3",
                                                        "provider_metadata": null,
                                                        "createdAt": "2023-04-11T08:44:21.712Z",
                                                        "updatedAt": "2023-05-02T14:58:57.730Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 15,
                            "attributes": {
                                "title": "No matching distribution found for pkg-resources==0.0.0",
                                "content": "\nThis error is often encountered by Linux users trying to install Python packages\nfrom the requirements.txt. This issue occurs only while using a virtual\nenvironment, specifically the virtualenv module of Python. When someone used\n`pip freeze > requirements.txt` to write the pip freeze's output requirements to\na file, a bug of that library leads to this error. It writes the requirement\n`pkg-resources==0.0.0` to the file, this will lead to the described error. There\nare multiple ways to fix this, depending on whether you are the maintainer of\nthe requirements or merely a user. As the maintainer of the repository, we\nstrongly suggest you switch from virtualenv to venv. Since Python 3.3, the venv\nmodule is a built-in module. To change your virtual environment, you may follow\nthe steps below.\n\n<howto>\n  <what>How to fix pkg-resources==0.0.0</what>\n  <minutes>5</minutes>\n  <description>\n    No matching distribution found for pkg-resources==0.0.0\n  </description>\n  <tool>Python: pip</tool>\n  <tool>Python: venv</tool>\n  <tool>UNIX based OS like MacOS or Linux</tool>\n  <step>\n    <name>Clear the dependencies</name>\n    <substep>\n      Write your dependencies and filter out the pkg-resources `pip freeze |\n      grep --invert-match pkg-resources > requirements.txt`\n    </substep>\n    <substep>\n      Remove the virtualenv, Assuming it is stored in a folder called “venv” `rm\n      -rf venv`\n    </substep>\n  </step>\n  <step>\n    <name>Create a new virtual environment</name>\n    <substep>Create a clean venv `python3 -m venv venv`</substep>\n    <substep>Activate it `source venv/bin/activate`</substep>\n    <substep>Reinstall requirements `pip install -r requirements.txt`</substep>\n  </step>\n</howto>\n\n**Done!** The error should no longer occur.\n\nIf you are not the maintainer of the repository we suggest you recommend this\npost to the maintainer. While the maintainer is working on fixing this, you can\ninstall the dependencies similarly to the freeze command above, by filtering the\npackages for it:\n\n```shell\ncat requirements.txt | grep --invert-match pkg-resources | xargs -n 1 pip install\n```\n\n### Explanation\n\ncat will output the content of the requirements, grep will filter\nit for pkg-resources==0.0.0, and xargs -n 1 will execute pip install for each\nline returned by the preceding commands.\n\nWe hope this solves your issue. If you encounter any problems, please don't\nhesitate to leave a comment. We will try to help you as soon as possible!\n\n## What is pkg-resources?\n\n> The pkg_resources module distributed with setuptools provides an API for\n> Python libraries to access their resource files, and for extensible\n> applications and frameworks to automatically discover plugins. It also\n> provides runtime support for using C extensions that are inside zipfile-format\n> eggs, support for merging packages that have separately-distributed modules or\n> subpackages, and APIs for managing Python's current “working set” of active\n> packages.\n> \n> Python Setuptools, https://setuptools.pypa.io/en/latest/pkg_resources.html\n\nIn essence: pkg-resources is a development dependency of packages which use\nsetuptools. Usually it should not be part of any actual packages. This\nis clearly a bug in `virtualenv`.\n",
                                "slug": "pkg-resources",
                                "publishDate": "2021-03-15",
                                "excerpt": "Wonder what the f**k pkg-resources==0.0.0 is? This is caused by an error of the virtualenv library. Learn how to fix it.",
                                "createdAt": "2023-04-10T16:38:44.256Z",
                                "updatedAt": "2023-04-10T16:38:44.256Z",
                                "publishedAt": "2023-04-10T16:38:44.254Z",
                                "author": {
                                    "data": {
                                        "id": 4,
                                        "attributes": {
                                            "name": "Yannic Schröer",
                                            "slug": "yannic",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-05-02T15:39:45.245Z",
                                            "publishedAt": "2023-04-10T16:03:39.313Z",
                                            "image": {
                                                "data": {
                                                    "id": 3,
                                                    "attributes": {
                                                        "name": "Unbenannt.PNG",
                                                        "alternativeText": null,
                                                        "caption": null,
                                                        "width": 879,
                                                        "height": 699,
                                                        "formats": {
                                                            "small": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/small_Unbenannt_bb5374b218.PNG",
                                                                "hash": "small_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "small_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 18.44,
                                                                "width": 500,
                                                                "height": 398
                                                            },
                                                            "medium": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/medium_Unbenannt_bb5374b218.PNG",
                                                                "hash": "medium_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "medium_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 29.78,
                                                                "width": 750,
                                                                "height": 596
                                                            },
                                                            "thumbnail": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/thumbnail_Unbenannt_bb5374b218.PNG",
                                                                "hash": "thumbnail_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "thumbnail_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 7.33,
                                                                "width": 196,
                                                                "height": 156
                                                            }
                                                        },
                                                        "hash": "Unbenannt_bb5374b218",
                                                        "ext": ".PNG",
                                                        "mime": "image/png",
                                                        "size": 6.96,
                                                        "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/Unbenannt_bb5374b218.PNG",
                                                        "previewUrl": null,
                                                        "provider": "aws-s3",
                                                        "provider_metadata": null,
                                                        "createdAt": "2023-04-11T08:44:21.712Z",
                                                        "updatedAt": "2023-05-02T14:58:57.730Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 18,
                            "attributes": {
                                "title": "Underscores in Python",
                                "content": "\n## Types of underscores\n\nThere are various possibilities to encounter or use underscores in Python, and\nthey seem confusing if you aren't familiar with the conventions and concepts\nthey are used in. There are basically these five types of underscores you might\nface:\n\n1. simple underscore: **\\_**\n2. leading underscore: **\\_x**\n3. subsequent underscore: **x\\_**\n4. double leading underscore: **\\_\\_x**\n5. double leading and subsequent underscore: **\\_\\_x\\_\\_**\n\n## The simple underscore in Python\n\nThe simple underscore is often used as a variable when someone wants to indicate\nthat the variable doesn't matter.\n\n```python\nfor _ in range(42):\n    print(\"The meaning of life\")\n```\n\nAs you see the variable is useless here, I just use it to print \"the meaning of\nlife\" 42 times.\n\nAnother usage for the simple underscore in the Python REPL (read evaluate print\nloop) is to print the last evaluated expression:\n\n```python\nIn[1]:   a = 42\nIn[2]:   b = 1337\nIn[3]:   a*b\nOut[3]:  56154\nIn[4]:   _\nOut[4]:  56154\n```\n\n## The leading underscore in Python\n\nThe leading underscore indicates that the following variable should be in the\nprivate scope of a class. However, Python does not have a concept of visibility,\nthis is just a convention. When someone uses a leading underscore, all he or she\nwant's to say is that this should not be visible from outside. If you have\nwritten in Java or another language that comes with visibility concepts you\nshould have come along this concept yet. For those starting with Python this\nseems odd.\n\n```python\nclass PublicClass:\n  \n  def __init__(self, attribute):\n    self.attribute = attribute\n    self._private_attribute = \"Initialized\" # I am private \n    \n  def get_private_attribute(self):\n    return _private_attribute\n  \n  def set_private_attribute(self, value):\n    value += \"I am statically appended\"\n    # Do something fancy\n    self._private_attribute = value\n```\n\nSo, looking at this method, the underscore indicates that the\n_\\_private\\_attribute_ is private and should not be accessed directly. In\ncontrast to the current example: If there are also no methods to interact with\nthe attribute, this usually indicates that this variable should only be visible\nto the inner context, hence the class, method or whatever.\n\n## Subsequent underscore in Python\n\nThe subsequent underscore merely indicates that the original name is conflicting\nwith a reserved keyword. For example if the input of my function might be\nlambda, the interpreter will return a syntax error as it conflicts:\n\n```python\ndef function(lambda):\n    pass\n```\n\nIf I simply use an underscore after lambda, the interpreter will accept it again\nand I am still able to use my meaningful name:\n\n```python\ndef function(lambda_):\n    pass\n```\n## The double leading underscores in python\n\nThis is the first underscore in Python we covered so far, that isn't a bare\nconvention. When you add double leading underscores to a variable the so called\nname mangling will be applied. Name mangling instructs the compiler to protect\nthe variable from being overwritten by sub classes. A short example:\n\n```python\nclass MyClass:\n\n    def __init__(self):\n        self.__MyAttribute = 42\n```\n\nIf we now create an instance of MyClass:\n\n```python\nIn[1]: from underscores import MyClass\nIn[2]: myclass = MyClass()\nIn[3]: dir(myclass)\nOut[3]: ['_MyClass__MyAttribute', '__class__', '__delattr__', '__dict__', '__dir__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__gt__', '__hash__', '__init__', '__init_subclass__', '__le__', '__lt__', '__module__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__']\n```\n\nWe see that our class now has a weirdly named attribute\n_\\_MyClass\\_\\_MyAttribute_ and as you see below, you don't may access it with\nthe name you gave it in your constructor.\n\n```python\nIn[1]: myclass.__MyAttribute\nOut[1]:    Traceback (most recent call last):\n              File \"<input>\", line 1, in <module>\n           AttributeError: 'MyClass' object has no attribute '__MyAttribute'\n\nIn[2]:  myclass._MyClass__MyAttribute\nOut[2]: 42\n```\n\nTo access the attribute you instead have to use the class name with a leading\nunderscore. This prevents attributes from being overwritten from sub classes as\nthe name becomes more unique. In your class itself, you may still use\n_\\_\\_MyAttribute_ instead of the shown name. Nevertheless as you may assume,\nthis isn't a guarantee. If you name your variable _\\_MyClass\\_\\_MyAttribute_ you\ncould still overwrite it (but I can absolutely not imagine why you would do\nthis)\n\n![disgusted displeased senior bald man in yellow\nshirt](/assets/blog/posts/underscores/disgusted-old-man.webp)\n\n## Double leading and subsequent underscores in Python\n\nFinally we get to the most common example of underscores in Python. If you look\nsharply you notice that we got nearly a ton of those up there when we printed\nthe built-in function\n_[dir](https://docs.python.org/3/library/functions.html#dir)_ of our class. So\nwhy didn't I just explain the double leading and trailing underscores first?\nBecause name mangling doesn't apply here! And the only reason is, that trailing\ndouble underscores disable the name mangling feature.\n\nWhat are those double leading and subsequent underscores now? In short: they\nindicate built-in methods and you shouldn't name your functions with double\nleading and trailing underscores, as this might result into overwriting Python\ncore functions unintentionally. However there are some cases in which you\nespecially want to override those functions deliberately, which is allowed of\ncourse. For some constructs like context managers it is even necessary to\noverride certain build-in functions.\n\nIf you're deep into Python you might also encounter the term _dunder_ which is\nshort for \"double under\". So we would pronounce our class as \"dunder\nMyAttribute\". But note that we would also pronounce \"\\_\\_init\\_\\_\" as dunder\ninit not \"dunder init dunder\".\n\nThis concludes my article on underscores in Python. I hope you enjoyed reading\nand didn't miss anything. Whatever your impression of my post was, I would love\nto hear your feedback!\n",
                                "slug": "underscores",
                                "publishDate": "2020-09-29",
                                "excerpt": "Python is a great language in my eyes, it’s simple to understand, write and its indentation forces at least a bit of styling into the code. But when it comes to underscores, there’s often confusion.",
                                "createdAt": "2023-04-10T16:44:41.352Z",
                                "updatedAt": "2023-04-10T16:44:41.352Z",
                                "publishedAt": "2023-04-10T16:44:41.326Z",
                                "author": {
                                    "data": {
                                        "id": 4,
                                        "attributes": {
                                            "name": "Yannic Schröer",
                                            "slug": "yannic",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-05-02T15:39:45.245Z",
                                            "publishedAt": "2023-04-10T16:03:39.313Z",
                                            "image": {
                                                "data": {
                                                    "id": 3,
                                                    "attributes": {
                                                        "name": "Unbenannt.PNG",
                                                        "alternativeText": null,
                                                        "caption": null,
                                                        "width": 879,
                                                        "height": 699,
                                                        "formats": {
                                                            "small": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/small_Unbenannt_bb5374b218.PNG",
                                                                "hash": "small_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "small_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 18.44,
                                                                "width": 500,
                                                                "height": 398
                                                            },
                                                            "medium": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/medium_Unbenannt_bb5374b218.PNG",
                                                                "hash": "medium_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "medium_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 29.78,
                                                                "width": 750,
                                                                "height": 596
                                                            },
                                                            "thumbnail": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/thumbnail_Unbenannt_bb5374b218.PNG",
                                                                "hash": "thumbnail_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "thumbnail_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 7.33,
                                                                "width": 196,
                                                                "height": 156
                                                            }
                                                        },
                                                        "hash": "Unbenannt_bb5374b218",
                                                        "ext": ".PNG",
                                                        "mime": "image/png",
                                                        "size": 6.96,
                                                        "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/Unbenannt_bb5374b218.PNG",
                                                        "previewUrl": null,
                                                        "provider": "aws-s3",
                                                        "provider_metadata": null,
                                                        "createdAt": "2023-04-11T08:44:21.712Z",
                                                        "updatedAt": "2023-05-02T14:58:57.730Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 19,
                            "attributes": {
                                "title": "7 Python Easter Eggs",
                                "content": "\n## Hello World\n\nI guess nearly everyone who ever got in touch with Python wrote the famous 'Hello World' \nprogram in Python, or at least know how to code it. But there is another easy way besides \nprinting it, you can also use the built-in implementation:\n\n```python\n>>> import __hello__\nHello world!\n```\n\n## The Zen of Python\n\nThis easter egg is probably the most known one, at least the experienced Python programmers \nare likely to know it. Tim Peters created 20 guiding principles, 19 ones are written down as \nthe **Zen of Python**. This feature is also documented in the \n[PEP 20 guideline](https://www.python.org/dev/peps/pep-0020/).\n\nThe Zen of Python is telling Python's philosophy and best practices. The message is mainly \nabout code quality, design, and how to solve problems. If you follow them, you will \n[improve your code](https://code-specialist.com/category/write-better-code/) and the way you \nsolve problems.\n\nYou can see the Zen of Python by importing the module _this_, try it out!\n\n```python\n>>> import this\n```\n\n> Beautiful is better than ugly.  \n> Explicit is better than implicit.  \n> Simple is better than complex.  \n> Complex is better than complicated.  \n> Flat is better than nested.  \n> Sparse is better than dense.  \n> Readability counts.  \n> Special cases aren't special enough to break the rules.  \n> Although practicality beats purity.  \n> Errors should never pass silently.  \n> Unless explicitly silenced.  \n> In the face of ambiguity, refuse the temptation to guess.  \n> There should be one-- and preferably only one --obvious way to do it.\n> Although that way may not be obvious at first unless you're Dutch.  \n> Now is better than never.  \n> Although never is often better than \\*right\\* now.  \n> If the implementation is hard to explain, it's a bad idea.  \n> If the implementation is easy to explain, it may be a good idea.  \n> Namespaces are one honking great idea -- let's do more of those!\n> \n> The Zen of Python, by Tim Peters\n\nIndeed, there is another awesome aspect of this easter egg. If you are interested, take a look \nat the [source code file of the module _this_](https://github.com/python/cpython/blob/master/Lib/this.py).\n\n## Uncle Barry\n\nIn the evolving process of Python, the debate of the inequality operator implementation had two \nopposite sides some time ago. The **!=** version finally won the battle against the diamond operator \n**&gt;&lt;** to avoid any ambiguity and improve the readability.\n\nThe well-known Python programmer Barry Warsaw (aka Uncle Barry) had the honor to become the Friendly \nLanguage Uncle For Life (FLUFL). Sadly, he is on the losing side of the debate and prefers the version \nfor the inequality operator. But if you have the same vision as Uncle Barry, you can simply import a \nlibrary to change the rules and use the other variant!\n\n```python\n>>> from __future__ import barry_as_FLUFL\n\n>>> 0 != 1\nSyntaxError: with Barry as BDFL, use '<>' instead of '!='\n  \n>>> 0 <> 1\nTrue\n\n>>> 1 <> 1\nFalse\n```\n\nUsing the official inequality operator then raises a SyntaxError, you have to use the other operator instead. \nAs an April fool, [PEP 401](https://www.python.org/dev/peps/pep-0401/) says that this operator got enacted by \nthe FLUFL in 2009 (and some other stupid changes).\n\n## Braces\n\nOne of the most amazing differences between coding in Python and most of the other programming languages (Java, \nC++, JavaScript, etc.) is the following: No curly braces! (except for dicts and sets, but they don't count). I \nthink everyone who had to deal with a code containing thousands of curly braces will appreciate the simplicity \nof Python with nothing more than indentations. It's just easier and more readable without curly braces, so \nPython wants to show that they aren't tolerated in the language.\n\nYou can try to import the braces from the \\_\\_future\\_\\_ build-in module if you can't resist the temptation to \nuse them, but look what happens:\n\n```python\n>>> from __future__ import braces\nSyntaxError: not a chance\n```\n\n## Antigravity\n\nYou can experience antigravity by Python coding, believe me! Just run the following code and see what appears \non your screen:\n\n```python\n>>> import antigravity\n```\n\n## Hash\n\nIs it possible to create a hash of infinity or a NaN value? In Python it is!\n\n```python\n>>> hash(float('inf'))\n314159\n\n>>> hash(float('nan'))\n0\n```\n\n## Monty Python References\n\nThe Name **Python** is an homage to the English comedy group **Mont**y **Python**. Furthermore, the docs say that \nthe language is named after the BBC show “Monty Python's Flying Circus”.\n\n> Making references to Monty Python skits in documentation is not only allowed, it is encouraged!\n> \n> [Official Python Tutorial](https://docs.python.org/3.8/tutorial/appetite.html)\n\nThere are some references to Monty Python jokes hidden in the whole Python environment, here are a few examples:\n\n- Funny quote of _Monty Python and the Holy Grail_ in the [official input and output documentation](https://docs.python.org/3.8/tutorial/inputoutput.html#the-string-format-method)\n- Instead of using _foo_ and _bar_, many tutorials use _spam_ and _egg_\n- The name of the [wheel](https://www.python.org/dev/peps/pep-0427/) ZIP-format for Python's sdist packages is based on the [Cheese Shop sketch](https://www.youtube.com/watch?v=Hz1JWzyvv8A) by Monty Python\n\nThese are a few Monty Python reference easter eggs, I am sure you can find more by exploring the Python documentation \nand tutorials!\n\n* * *\n\nI presented some cool and funny easter eggs you can find by using Python, I hope you enjoyed it! If you want to explore \nmore funny and interesting Aspects of Python, you can take a look at the [Python Humor](https://www.python.org/doc/humor/) \npage in the documentation. If you have any feedback or another cool easter egg that is still missing here, let me know in \nthe comments below!\n",
                                "slug": "python-easter-eggs",
                                "publishDate": "2020-10-28",
                                "excerpt": "Python is an exciting language and has always some surprises in store, no matter how long you have been working with it. In this Post, I will present 7 really cool easter eggs in Python. Feel free to try them out on your own, I hope you enjoy it!",
                                "createdAt": "2023-04-10T16:44:41.355Z",
                                "updatedAt": "2023-05-02T14:59:01.894Z",
                                "publishedAt": "2023-04-10T16:44:41.337Z",
                                "author": {
                                    "data": {
                                        "id": 3,
                                        "attributes": {
                                            "name": "Jonas Scholl",
                                            "slug": "jonas",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-04-10T16:03:39.315Z",
                                            "publishedAt": "2023-04-10T16:03:39.311Z",
                                            "image": {
                                                "data": null
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        },
        {
            "id": 28,
            "attributes": {
                "name": "Code Principles",
                "slug": "code-principles",
                "hexColor": "#f0ef9a",
                "createdAt": "2023-04-10T16:14:27.465Z",
                "updatedAt": "2023-04-10T16:14:27.465Z",
                "publishedAt": "2023-04-10T16:14:27.455Z",
                "posts": {
                    "data": [
                        {
                            "id": 4,
                            "attributes": {
                                "title": "DRY Principle",
                                "content": "\n## The DRY Acronym\n\nDRY stands for “**d**on’t **r**epeat **y**ourself”. The DRY principle is one of\nthe most important principles in software development, if not even the most\nimportant. Whenever you write or read code and find repetition in it, chances\nare high you or whoever planned it, didn't plan well enough.\n\n## What's the problem about code repetition?\n\nCode isn't static. When you write code twice you have to test it twice and if\nyou have to change it afterwards you also have to change it twice, in fact we\nalready got the four-fold effort to invest. There is also a large chance, you\nmiss the second occurrence. Seriously, nobody can remind himself to every line\nor routine of code he wrote in a project, at least if it isn't an insanely small\none.\n\n> There is a word for software that isn't changed: Hardware\n> \n> Unknown author\n\nIn fact, redundant code is not only one of the most common causes for bugs, it's\nalso the cause for unnecessary complex or at least long code. The DRY principle\nhelps you to avoid these problems.\n\n## Example of duplicated code\n\n```python\nfirst_player_points = [2, 3, 0, 5]\nsecond_player_points = [4, 1, 1, 2]\n\ndef get_score_for_first_player():\n  return sum(first_player_points)\n\ndef get_score_for_second_player():\n  return sum(second_player_points)\n```\n\nWhats wrong by changing this to:\n\n```python\nplayer_points = {\n  1: [2, 3, 0, 5],\n  2: [4, 1, 1, 2]\n}\n\ndef get_score_for_player(player_number: int):\n  points = player_points[player_number]\n  return sum(points)\n```\n\nI am aware that this is a rather simplified example and that the solution\ndoesn't apply to every problem, but that's not the point. Fact is, by\ngeneralizing concepts and for example moving redundant code to functions you\nsave time and spare potential bugs. If applied correctly it may also increase\nthe readability of your code.\n\n## How to apply the DRY principle?\n\nThere is no general concept that allows you to always spare repetition, but\nthere are steps that may help you to minimize it.\n\n### Plan thoroughly \n    \nBy planing your program or software carefully you may identify patterns and\ngeneralized concepts in an early stage.\n    \n### Review frequently \n    \nReview your code frequently, or even better let someone else review your\ncode (That will also ensure your code doesn't exceed a certain level of\nillegibility).\n    \n### Use tools that support you \n    \nDepending on how large your project is, it's nearly impossible to find\nrepetition manually. But there are tools that allow you to find repeated\ncode anyway. For instance PyCharm¹ offers a duplicates tool window that\nallows you to identify code repetition.\n\n## References \n- [Link to PyCharm](https://www.jetbrains.com/de-de/pycharm/)\n",
                                "slug": "dry",
                                "publishDate": "2020-06-15",
                                "excerpt": "Do you tend to repeat code over and over again? There are several important reasons besides DRY (Don’t Repeat Yourself) not to do so.",
                                "createdAt": "2023-04-10T16:37:54.288Z",
                                "updatedAt": "2023-04-10T16:37:54.288Z",
                                "publishedAt": "2023-04-10T16:37:54.279Z",
                                "author": {
                                    "data": {
                                        "id": 4,
                                        "attributes": {
                                            "name": "Yannic Schröer",
                                            "slug": "yannic",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-05-02T15:39:45.245Z",
                                            "publishedAt": "2023-04-10T16:03:39.313Z",
                                            "image": {
                                                "data": {
                                                    "id": 3,
                                                    "attributes": {
                                                        "name": "Unbenannt.PNG",
                                                        "alternativeText": null,
                                                        "caption": null,
                                                        "width": 879,
                                                        "height": 699,
                                                        "formats": {
                                                            "small": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/small_Unbenannt_bb5374b218.PNG",
                                                                "hash": "small_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "small_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 18.44,
                                                                "width": 500,
                                                                "height": 398
                                                            },
                                                            "medium": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/medium_Unbenannt_bb5374b218.PNG",
                                                                "hash": "medium_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "medium_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 29.78,
                                                                "width": 750,
                                                                "height": 596
                                                            },
                                                            "thumbnail": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/thumbnail_Unbenannt_bb5374b218.PNG",
                                                                "hash": "thumbnail_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "thumbnail_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 7.33,
                                                                "width": 196,
                                                                "height": 156
                                                            }
                                                        },
                                                        "hash": "Unbenannt_bb5374b218",
                                                        "ext": ".PNG",
                                                        "mime": "image/png",
                                                        "size": 6.96,
                                                        "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/Unbenannt_bb5374b218.PNG",
                                                        "previewUrl": null,
                                                        "provider": "aws-s3",
                                                        "provider_metadata": null,
                                                        "createdAt": "2023-04-11T08:44:21.712Z",
                                                        "updatedAt": "2023-05-02T14:58:57.730Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 5,
                            "attributes": {
                                "title": "Do one thing - Not the single responsibility principle (SRP)",
                                "content": "\n## About do one thing\n\nDo one thing at a time - As stated in our earlier posts like [DRY Principle (Computer Science)](https://code-specialist.com/code-principles/dry-principle/), [KISS Principle (Computer Science)](https://code-specialist.com/code-principles/kiss-principle/), or even [Comments – What you should keep in mind](https://code-specialist.com/write-better-code/comments/), **readability** should be crucial to anyone's code.\n\nSomething that lastingly improves the readability of your code is a technique called \"do one thing\". It is often confused with the single responsibility principle (SRP), and the names are indeed confusing, in my opinion.\n\nThe main concept behind this is to reduce the code's complexity by diminishing the things statements and functions do, to exactly **one simple thing**.\n\n## Garbage Code\n\nTo show you an example of how it works and how significant the improvements can be, look at the following (garbage) code:\n\n```python\nclass Sieve:\n    start = 2\n\n    def __init__(self, n):\n        self.n = n\n\n    def run(self):\n        l = [True] * self.n\n        prims = list()\n        for i in range(self.start, self.n):\n            if l[i] is True:\n                prims.append(i)\n                for j in range(i + 1, self.n):\n                    if l[j] is True:\n                        if j % i == 0:\n                            l[j] = False\n            else:\n                continue\n        return prims\n\n\ns = Sieve(120)\nprint(s.run())\n```\n\n## Sieve of Erastothenes\n\nWhat does this code do? Rarely anybody can tell that after just reading it. If you read it thoroughly or inspect the output\n\n```\n[2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113]\n```\n\nYou might find out that this is actually the [sieve of Eratosthenes](https://en.wikipedia.org/wiki/Sieve_of_Eratosthenes) or at least any algorithm dealing with prime numbers. But if you never heard of the sieve of Eratosthenes, you will most likely search a while until you figure out what this code does and why.\n\nAnd even if you wrote this and are fully aware of what it does, you might forget all of it in just a few days.\n\n## Why is that code garbage?\n\nSome people might argue that the code works perfectly fine, and some might even argue, \"but it is optimized!\". Besides someone telling you that most likely never heard of broadcasting in Python, he or she also didn't respect the first rule of optimization:\n\n> The first rule of optimization is: _Don't do it._\n>\n> Bjarne Stroustrup - C++ Coding Standards\n\nAnd the reason for that is that you never really know what your compiler or interpreter actually does. Things that look complex to calculate might be faster than some \"optimized\" branch of code. To effectively optimize code, you need profound insights into the language at hand and the compiler or interpreter.\n\nThis is a job for **experts** that are specialized in this kind of work. As a developer, you should always rate **readability over optimization**. However, refactorings regarding optimization also should only be done if the time required for computation largely exceeds the expectations.\n\n> The second rule of optimization (for experts only) is: _Don’t do it yet_.\n>\n> Bjarne Stroustrup - C++ Coding Standards\n\n## Improved Code\n\nWith the concept of the sieve at hand and the idea of a simple job, let's rephrase our code in a more meaningful way.\n\n```python\nclass SieveOfEratosthenes:\n    start = 2\n    prime_numbers = list()\n\n    def __init__(self, maximum):\n        self.maximum = maximum\n        self.boolean_array = [True] * self.maximum\n\n    def run(self):\n        self.sieve()\n        return self.prime_numbers\n\n    def add_prime_number(self, number):\n        self.prime_numbers.append(number)\n\n    def is_prime(self, index):\n        return self.boolean_array[index]\n\n    def sieve(self):\n        for number in range(self.start, self.maximum):\n            if self.is_prime(number):\n                self.add_prime_number(number)\n                self.remove_multiples_from_sieve(number)\n            else:\n                continue\n\n    def remove_multiples_from_sieve(self, prime):\n        for number in range(prime, self.maximum):\n            if number % prime == 0:\n                self.boolean_array[number] = False\n\n\nsieve = SieveOfEratosthenes(maximum=120)\nprint(sieve.run())\n```\n\nIsn't this, in contrast, way easier to read and get? Even if your code is still garbage, using the name of the concept as the class name, you can reduce someone else's research effort from hours to minutes as they can easily find what this should be about. The functions themselves are easy to read as the function name represents exactly the one thing the function does.\n\nThank you for reading this article! I hope I was able to make the point. I am aware that the improved sieve code isn't perfect. If you come up with an even better to read solution, please e-mail us or post a comment. The smartest solution you can come up with will be permanently displayed here.\n",
                                "slug": "do-one-thing",
                                "publishDate": "2020-07-20",
                                "excerpt": "The “Do one thing” rule for programming is essential to everyone’s clean code philosophy. Learn why and how to apply it.",
                                "createdAt": "2023-04-10T16:37:54.357Z",
                                "updatedAt": "2023-04-10T16:37:54.357Z",
                                "publishedAt": "2023-04-10T16:37:54.335Z",
                                "author": {
                                    "data": {
                                        "id": 4,
                                        "attributes": {
                                            "name": "Yannic Schröer",
                                            "slug": "yannic",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-05-02T15:39:45.245Z",
                                            "publishedAt": "2023-04-10T16:03:39.313Z",
                                            "image": {
                                                "data": {
                                                    "id": 3,
                                                    "attributes": {
                                                        "name": "Unbenannt.PNG",
                                                        "alternativeText": null,
                                                        "caption": null,
                                                        "width": 879,
                                                        "height": 699,
                                                        "formats": {
                                                            "small": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/small_Unbenannt_bb5374b218.PNG",
                                                                "hash": "small_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "small_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 18.44,
                                                                "width": 500,
                                                                "height": 398
                                                            },
                                                            "medium": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/medium_Unbenannt_bb5374b218.PNG",
                                                                "hash": "medium_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "medium_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 29.78,
                                                                "width": 750,
                                                                "height": 596
                                                            },
                                                            "thumbnail": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/thumbnail_Unbenannt_bb5374b218.PNG",
                                                                "hash": "thumbnail_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "thumbnail_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 7.33,
                                                                "width": 196,
                                                                "height": 156
                                                            }
                                                        },
                                                        "hash": "Unbenannt_bb5374b218",
                                                        "ext": ".PNG",
                                                        "mime": "image/png",
                                                        "size": 6.96,
                                                        "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/Unbenannt_bb5374b218.PNG",
                                                        "previewUrl": null,
                                                        "provider": "aws-s3",
                                                        "provider_metadata": null,
                                                        "createdAt": "2023-04-11T08:44:21.712Z",
                                                        "updatedAt": "2023-05-02T14:58:57.730Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 8,
                            "attributes": {
                                "title": "KISS Principle (Keep it simple stupid)",
                                "content": "\n## What does KISS stand for?\n\nKISS stands for **Keep it simple stupid**. It is the first usability principle\nof product design but is also used as a coding principle. [Legends\nsay](https://en.wikipedia.org/wiki/KISS_principle#Origin) that the acronym was\nminted by [Kelly\nJohnson](https://www.lockheedmartin.com/en-us/news/features/history/johnson.html),\na lead engineer at Lockheed. Johnson handed his team of design engineers a\nhandful of tools and challenged them to build a jet aircraft that was fixable by\nwhat an average mechanic in the field under combat circumstances would have.\n\n## What does KISS mean?\n\nThe key design principle itself, however, is as simple as its name indicates:\nKeep it simple. This can be simple. But: there are countless ways to describe\nsomething in a complex way, but there might only be one that is precisely and\nshort. It's not only about simplifying things. You must be able to take a step\nback and view whatever you just did from one's perspective, who is totally\nclueless. You might have already engaged this problem by writing code and\nreviewing it some months after that. Many lines are unreadable crap because you\nweren't able to take a step back and simplify the concepts.  \n\nAs we mentioned earlier, KISS isn't a principle that is originated in computer\nscience. It can be applied to design processes in general, such as product or\nsoftware design. We, in this case, will focus on how to apply simplistic design\nto code itself.\n\n## Code is not written for machines\n\nThe code you write and the code you actually execute largely differ, depending\non the language and compiler or interpreter used. In fact, machines couldn't\ncare less about your code. All the programs and scripts you write are for\nhumans. You write it only once but read it possibly a thousand times. Thereby\nit's your responsibility to make this as easy, and thereby quick, to read as\npossible. Your code design objective thereby should be to offer the best user\nexperience possible. \n\n## Simple doesn't always mean short\n\nAnother mistake that is often made dealing with the KISS principle is that\npeople try to make code as short as possible. But the shortest solution is\nrather seldom the easiest to read. Consider the following \"Non-KISS\" example:\n\n```python\nf = lambda x: 1 if x <= 1 else x * f(x - 1)\n```\n\nNow look at this version:\n\n```python\ndef faculty(number: int) -> int:\n    if number <= 1:\n        return 1\n    else:\n        return number * faculty(number - 1)\n```\n\nSure, the first version is also readable, but it is considerably harder to do\nso. Adding a few descriptive names, type hints, and splitting the line into\nmultiple ones gets clearly easier to read. The main goal in design should always\nbe to be as easy to understand as possible. One of many common bad practices of\ndevelopers is to create fancy and unreadable \"oneliners\". There is absolutely no\nreason to do so. This will most certainly lead to someone, if not themself\nstruggling to decipher it.\n\n## How to apply the KISS principle?\n\nTo apply KISS to design and code, there hundreds of ways but, I want to provide\nyou with some ideas:\n\n### Simplify and explain concepts\n\nTry to code as simple as possible, unfold your concepts, name things properly\nand explain with comments where the code itself can't (Most of the time, it can\nand should!).\n    \n### Use descriptive names\n    \nAs easy as this sounds, trying to find [names that indicate something's true\nmeaning]() can be very challenging. You may try this by telling someone a name\nand let them assume what they think that is. Don't be afraid of long variable or\nfunction names. As stated earlier, the machine doesn't care and won't use your\nname anyway.\n    \n### Deconstruct problems into smaller ones\n    \nSomething that does real magic to the readability of your code is deconstructing\nthe problem and solving just one simple one with each function. Try refactoring\nyour code and solve a single problem at a time, but with a maximum of precision\nand readability.\n    \n### Try rubber\n    \nDid you ever try to explain your code to a dumb duck? No? Try [duck\ndebugging](https://rubberduckdebugging.com/)! By doing this, you may not only\nfind bugs, but you may also find gaps in your or someone else's understanding of\nthe current code.\n    \n### Learn more about Clean Code\n    \nMany principles and ideas of clean code build upon the KISS principle. By\napplying those concepts, you may find it easier to identify the simplest\nsolution.\n    \n\n## References\n\n- The origin of KISS -\n  [https://en.wikipedia.org/wiki/KISS\\_principle#Origin](https://en.wikipedia.org/wiki/KISS_principle#Origin)\n- Kelly Johnson -\n  [https://www.lockheedmartin.com/en-us/news/features/history/johnson.html](https://www.lockheedmartin.com/en-us/news/features/history/johnson.html)\n- Meaningful Names -\n  [https://code-specialist.com/code-principles/meaningful-names/](https://code-specialist.com/code-principles/meaningful-names/)\n- Rubber Duck Debugging -\n  [https://rubberduckdebugging.com/](https://rubberduckdebugging.com/)\n- More Posts on Code Principles Blog -\n  [https://code-specialist.com/code-principles/](https://code-specialist.com/code-principles/)\n",
                                "slug": "kiss",
                                "publishDate": "2020-07-18",
                                "excerpt": "KISS - an acronym for “keep it simple stupid” is a design rule that every professional developer should apply to their code. It reduces complexity and improves readability as well as maintainability by aiming for the simplest solution.",
                                "createdAt": "2023-04-10T16:37:54.421Z",
                                "updatedAt": "2023-04-10T16:37:54.421Z",
                                "publishedAt": "2023-04-10T16:37:54.391Z",
                                "author": {
                                    "data": {
                                        "id": 4,
                                        "attributes": {
                                            "name": "Yannic Schröer",
                                            "slug": "yannic",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-05-02T15:39:45.245Z",
                                            "publishedAt": "2023-04-10T16:03:39.313Z",
                                            "image": {
                                                "data": {
                                                    "id": 3,
                                                    "attributes": {
                                                        "name": "Unbenannt.PNG",
                                                        "alternativeText": null,
                                                        "caption": null,
                                                        "width": 879,
                                                        "height": 699,
                                                        "formats": {
                                                            "small": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/small_Unbenannt_bb5374b218.PNG",
                                                                "hash": "small_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "small_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 18.44,
                                                                "width": 500,
                                                                "height": 398
                                                            },
                                                            "medium": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/medium_Unbenannt_bb5374b218.PNG",
                                                                "hash": "medium_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "medium_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 29.78,
                                                                "width": 750,
                                                                "height": 596
                                                            },
                                                            "thumbnail": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/thumbnail_Unbenannt_bb5374b218.PNG",
                                                                "hash": "thumbnail_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "thumbnail_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 7.33,
                                                                "width": 196,
                                                                "height": 156
                                                            }
                                                        },
                                                        "hash": "Unbenannt_bb5374b218",
                                                        "ext": ".PNG",
                                                        "mime": "image/png",
                                                        "size": 6.96,
                                                        "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/Unbenannt_bb5374b218.PNG",
                                                        "previewUrl": null,
                                                        "provider": "aws-s3",
                                                        "provider_metadata": null,
                                                        "createdAt": "2023-04-11T08:44:21.712Z",
                                                        "updatedAt": "2023-05-02T14:58:57.730Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 9,
                            "attributes": {
                                "title": "SOLID Principles with Python Code Examples",
                                "content": "\n## What does SOLID stand for?\n\n**SOLID is a mnemonic acronym** of 5 acronyms themselves: **SRP** - Single Responsibility Principle, **OCP** - Open-Closed Principle, **LSP** - Liskov Substitution Principle, **\nISP** - Interface Segregation Principle, **DIP** - Dependency Inversion Principle.\n\nThese ideas were first mentioned by Robert C. Martin (Uncle Bob) in his\npaper _\"[Design Principles and Design Patterns](https://fi.ort.edu.uy/innovaportal/file/2032/1/design_principles.pdf)\"_. Later, Michael C. Feathers coined the SOLID acronym, which\nwas then re-used by Uncle Bob in the chapter \"_Design Principles_\" in his book \"Clean Architecture\".\n\n## Single Responsibility Principle (SRP)\n\n> There should never be more than one reason for a class to change\n>\n> SRP: The Single Responsibility Principle - Robert C. Martin\n\nThe **single responsibility principle** was coined by Robert C. Martin himself but he also pays credit to Tom DeMarco's concept of cohesion, which he described\nin \"Structured Analysis and System Specification\". It is the first of the SOLID principles and encourages to give classes only **a\nsingle** and definite **reason to change**. If you can think of more than a single reason for the class to change, the class has more than one responsibility. SRP is often confused\nwith the [\"Do one thing\"-rule](https://code-specialist.com/blog/do-one-thing/) At a first glance, this concept seems rather abstract and useless, but the example that is\nprovided in the initial paper is kind of helpful:\n\n![How to violate the Single Responsibility Principle. The Rectangle class has two reasons to change.](https://raw.githubusercontent.com/yannicschroeer/diagrams/3d65e422d6253dc0860b2809d13eb5cbac182247/srp_violation.svg)\n\nImagine a rectangle class that has the two public methods draw and area. The draw method should return coordinates or any graphical representation. The area method returns the area\nof the current rectangle instance. The rectangle class thereby has two responsibilities. It's responsible for calculating the area and responsible to draw itself.\n\n```python\nclass Rectangle(object):\n \n  def __init__(self, height: float, width: float):\n    self.height = height\n    self.width = width\n  \n  def draw(self) -> VisualRepresentation:\n    return visual_representation(self)\n  \n  def area()-> float:\n    return self.height*self.width\n```\n\nIf you are confused by the types behind the arguments in the constructor, you should have a look at [Python type hints](https://code-specialist.com/blog/type-hints/). However,\nchanges in the rectangle class would **affect** the GUI as well as the geometric calculation app. Changes in the rectangle class could potentially break the whole system or lead to\nunpredictable bugs. The solution Martin proposes in this specific case is to split the class into two separate ones:\n\n![Proposed solution to comply with the Single Responsibility Principle. A second class GeometricRectangle, implementing the math related methods](https://raw.githubusercontent.com/yannicschroeer/diagrams/46134d246c47b5564fd70f2f4d710a44f411888f/srp_solution.svg)\n\nThis separation leads to a **single responsibility** for each the geometric rectangle and the rectangle class. Changes in the draw method now can no longer affect the way they are\ncalculated.\n```python\nclass GeometricRectangle(object):\n  \n  def __init__(self, height: float, width: float):\n    self.height = height\n    self.width = width\n    \n  def area()-> float:\n    return height*width\n  \n\nclass Rectangle(GeometricRectangle):\n  \n  def draw(self) -> VisualRepresentation:\n    return visual_representation(self)\n```\n\nThe attentive readers might have noticed that this concept's **strict and mindless usage will also lead to poor software design**. It would help if you never used the single\nresponsibility theory without proper support of other constructs like modules or facades. Otherwise, the structure proposed by the SRP will cause the code to break into a thousand\nconfusing pieces\n\n## Open-Closed Principle (OCP)\n\n> Software entities (classes, modules, functions, etc.) should be open for extension but closed for modification.\n>\n> The Open Closed Principle - Robert C. Martin\n\nWhatever your personal definition of stable code is, this SOLID principle should be part of it. A good software architecture will almost certainly always fulfill the open-closed\nrule. Originally, Bertrand Mayer coined this concept in his book \"Object-Oriented Software Construction\". OCP applies to all kinds of\nobjects in programming you can imagine. This philosophy's main focus is to allow you to scale your classes and modules without caring about legacy code. To simplify this, we are\njust going to look at applying it to classes.\n\nThe key message of the **open-closed principle**, in this case, is that your classes should be open for extension but closed for modification. Meaning, once you created your class,\nit **shouldn't change** any more. However, it could change by simply creating a child class that thereby **extends its behavior**. Imagine you had a user class that holds a name\nand an age.\n\n```python\nclass User:\n  \n  def __init__(self, username: str, age: int):\n    self.username = username\n    self.age = age\n  \n  def __repr__(self):\n    return f\"User: {self.username}, {self.age} years old\"\n```\nNow imagine you want to extend this class by an attribute that saves the user's favorite game. A naive solution to this problem would be to simply add an attribute \"favorite\\_game\"\nto the user class:\n\n```python\nclass User:\n\n  def __init__(self, username: str, age: int, favorite_game: Game):\n      self.username = username\n      self.age = age\n      self.favorite_game = favorite_game\n\n  def __repr__(self):\n      return f\"User: {self.username}, {self.age} years old, favorite game: {self.favorite_game}\"    \n```\n\n\nThis might work if your system is small or in development. But if you want to change this in a productive system, things are going to break. Not only did the signature change\nbecause the constructor now expects a favorite\\_game, but also the _\\_\\_repr\\_\\__ method changed and might break things further. This violates Meyer's postulate. A possible\nsolution to this again could be inheritance:\n\n```python\nclass User:\n\n  def __init__(self, username: str, age: int):\n      self.username = username\n      self.age = age\n\n  def __repr__(self):\n      return f\"User: {self.username}, {self.age} years old\"\n\n\nclass Gamer(User):\n\n  def __init__(self, username: str, age: int, favorite_game: Game):\n      super().__init__(username, age)\n      self.favorite_game = favorite_game\n      \n  def __repr__(self):\n    return f\"User: {self.username}, {self.age} years old, favorite game: {self.favorite_game}\"     \n```\n\nBy using this, your **functionality is extended**, but you don't apply any changes to the original class. _Please note: Inheritance isn't always a good solution or a solution at\nall, but it is the easiest example to make._ _SOLID is not directly related to inheritance or polymorphism._\n\n## Liskov Substitution Principle (LSP)\n\n> _Subtype Requirement_: Let _**φ(x)**_ be a property provable about objects **_x_** of type _**T**_. Then **_φ(y)_** should be true for objects **_y_** of type **_S_** where _**S**_ is a subtype of _**T**_.\n>\n> A behavioral notion of subtyping - Barbara Liskov and Jeanette Wing\n\nWhen you are most familiar with Python or hate maths, the **Liskov substitution principle** might be slightly confusing. This is because it originally was designed for **statically\ntyped programming languages** like Java, C, or FORTRAN. [Barbara Liskov](http://www.pmg.csail.mit.edu/~liskov/) introduced it in 1987. It is often considered the hardest of the\nSOLID principles to understand. Visualizing Liskov's definition leads to the following class diagram:\n\n![Liskov Substistion Principle definition as an UML class diagram](https://raw.githubusercontent.com/yannicschroeer/diagrams/64e744c8f9f3b7f04c9cf5f2cd81c0cd754816d8/liskov.svg)\n\nWe have a type **_T_** and a subtype _**S**_, and objects of _**x**_ that are of type **_T_** and objects _**y**_ of type _**S**_. Also, all the elements posses an attribute **_φ_**.\nA representation in Python code could look like this:\n\n```python\nclass T:\n  \n  def __init__(self, phi: list):\n    self.phi = phi\n    \nclass S(T):\n  pass\n\nif __name__ == \"__main__\":\n  x = T(phi=[\"a\", \"b\"])\n  y = S(phi=[\"c\", \"d\"])\n```\n\nAnd this indeed fulfills the Liskov substitution principle. Any object of type _**S**_ could replace its parent class. How could you possibly violate this?\n\n```python\nclass T:\n  \n  def __init__(self, phi: list):\n    self.phi = phi\n    \nclass S(T):\n  \n  def __init__(self, phi: str):\n    self.phi = phi\n\nif __name__ == \"__main__\":\n  x = T(phi=[\"a\", \"b\"])\n  y = S(phi=\"c, d\")\n```\n\nIf you look closely, you will see that the subtype S implements its own class attribute phi of type string instead of list. This violates Liskov's theory. You can no longer\nreplace _**T**_ with objects of type _**S**_. One becomes aware of this concept's meaningfulness when you think about implementing a method \"_print\\_phis_\" that should solely print\nall elements in the class attribute phi. Either instances of class _**T**_ or _**S**_ would run into a runtime error or lead to a higher degree of complexity in the \"_print\\_phis_\"\nmethod due to additional conditionals.\n\n## Interface Segregation Principle (ISP)\n\n> Clients should not be forced to depend upon interfaces that they do not use.\n>\n> The Interface Segregation Principle - Robert C. Martin\n\nISP or **interface segregation principle** is the SOLID equivalent of **high cohesion**\nin [GRASP (General Responsibility Assignment Software Principles)](/grasp/). Thereby it naturally supports loose coupling and\nmaintainability. The main message behind ISP is that large Interfaces should be split into multiple ones. Functions and classes should not depend on methods they don't use. Look at\nthe following example for a \"fat\" interface:\n\n```python\nclass GeometricInterface(ABC):\n  \n  @abstractmethod\n  def get_area() -> float:\n    raise NotImplementedError\n    \n  @abstractmethod\n  def get_diameter() -> float:\n    raise NotImplementedError\n    \nclass Square(GeometricInterface):\n  \n  def __init__(self, height: float, width: float):\n    self.height = height\n    self.width = width\n  \n  def get_area():\n    return self.height*self.width\n  \n  def get_diameter() -> float:\n    raise NotImplementedError\n  \nclass Circle(GeometricInterface):\n  \n  def __init__(self, radius: float):\n    self.radius = radius\n  \n  def get_area():\n    return self.radius * PI **2\n  \n  def get_diameter() -> float:\n    return self.radius*2\n```\n\nPlease excuse the far-fetched example, nothing I'm proud of. However, as you can see, the GeometricInterface has two abstract methods of which `get_diameter()` is not used by\nits subtype square. Thereby the interface segregation rule is violated. There are many possible solutions to this. We could, for instance, segregate the GeometricInterface into\nthree Interfaces:\n\n```python\nclass GeometricInterface(ABC):\n  \n  @abstractmethod\n  def get_area() -> float:\n    raise NotImplementedError\n\nclass ElipseInterface(GeometricInterface, ABC):\n  \n  @abstractmethod\n  def get_diameter() -> float:\n    raise NotImplementedError\n\nclass RectangleInterface(GeometricInterface, ABC):\n  pass\n\n\nclass Square(Rectangle):\n\n    def __init__(self, height: float, width: float):\n        self.height = height\n        self.width = width\n\n    def get_area(self):\n        return self.height * self.width\n\nclass Circle(Elipse):\n\n    def __init__(self, radius: float):\n        self.radius = radius\n\n    def get_area(self):\n        return self.radius * PI ** 2\n\n    def get_diameter(self) -> float:\n        return self.radius * 2\n```\n\n## Dependency Inversion Principle (DIP)\n\n> A: High level modules should not depend upon low level Modules. Both should depend upon abstractions.\n>\n> B: Abstractions should not depend upon details. Details should depend upon abstractions.\n>\n> The Dependency Inversion Principle - Robert C. Martin\n\nIn my opinion, the **dependency inversion principle** is the easiest one to understand. However, it can be the hardest to implement. In essence, the DIP states that modules should\nnot rely on modules that belong to a subordinate concept and should not rely on generalizations. A quick piece of code that is often referenced:\n\n```python\nclass LightBulb:\n  \n  def __init__(self, initial_state: bool=False):\n    self.power = initial_state\n    \n  def turn_on(self):\n    self.power = True\n    \n  def turn_off(self):\n    self.power = False\n\nclass Switch:\n  \n  def __init__(self, light_bulb: LightBulb, pressed: bool=False):\n    self.light_bulb = light_bulb\n    self.pressed = pressed\n    \n  def toggle(self):\n    self.pressed = not self.pressed # Toggle\n    if self.pressed:\n      self.light_bulb.turn_on()\n    else:\n      self.light_bulb.turn_off()\n```\n\nThe **DIP violation** here is that a switch is a concept that is logically in a layer above the light bulb, and the switch relies on it. This will lead to poor extensibility or\neven circular imports that prevent the program from being interpreted or compiled.\n\n![Violating the Dependency Inversion Principle. The controller module relies on the device module instead vice versa](https://raw.githubusercontent.com/yannicschroeer/diagrams/fe1c96e84d8ef0701c95399a796805d6c938cf46/dip_violation.svg)\n\nInstead of the light bulb telling the switch how the bulb should be handled, the switch should tell the light bulb how to implement it. The naive approach would be to define an\ninterface that tells the light bulb how it should behave to be used with a switch.\n\n```python\nclass Device(ABC):\n  power: boolean\n    \n  def __init__(self, initial_state: bool=False):\n    self.power = initial_state\n    \n  def turn_on(self):\n    raise NotImplementedError\n  \n  def turn_off(self):\n    raise NotImplementedError\n    \nclass Switch:\n  \n  def __init__(self, device: Device, pressed: bool=False):\n    self.device = device\n    self.pressed = pressed\n    \n  def toggle(self):\n    self.pressed = not self.pressed # Toggle\n    if self.pressed:\n      self.device.turn_on()\n    else:\n      self.device.turn_off()  \n\nclass LightBulb(Device):\n  \n  def turn_on(self):\n    self.power = True\n    \n  def turn_off(self):\n    self.power = False\n```\n\nVisualized as a class diagram, this source code would lead to the object-oriented design:\n\n![Dependency Inversion Principle in an UML class diagram. A Device Interface as the solution for the switch not to rely on the light bulb](https://raw.githubusercontent.com/yannicschroeer/diagrams/14b34110edd15e8d5325a5e28c8e61ca91df3670/dip_solution.svg)\n\n**The dependency has been inverted**. Instead of the switch relying on the light bulb, the light bulb now relies on an interface in a higher module. Also, both rely on\nabstractions, as required by the **DIP**. Last but not least, we also fulfilled the requirement \"Abstractions should not depend upon details. Details should depend upon\nabstractions\" - The details of how the device behaves rely on the abstraction (Device interface).\n\n## Conclusion\n\nAs with all guidelines, it's not recommended to follow the SOLID principles blindly either. Principles, patterns, and guidelines can easily turn into anti-patterns and lead to new\nproblems. Sometimes it not preventable to violation some of these. Our job as a developer is to create code and programs that\nare [easy to read and thereby easy to maintain and extend](https://code-specialist.com/code-principles/kiss-principle/). Robustness and correctness are more or less nice side\neffects of this approach. These are great guidelines, but that's what they are, guidelines. Specific problems need specific solutions. All principles and patterns can offer are\nsuggestions and best practices.\n\nIf you support my statement or are of a completely different opinion I would love to hear about it in the comments section.\n\n## References\n\n- [SRP: The Single Responsibility Principle - objectmentor.com, 02.02.2015](https://web.archive.org/web/20150202200348/http://www.objectmentor.com/resources/articles/srp.pdf)\n- [The Open-Closed Principle - objectmentor.com, 02.02.2015](https://web.archive.org/web/20150212141727/http://www.objectmentor.com:80/resources/articles/ocp.pdf)\n- [The Liskov Substitution Principle - objectmentor.com 11.02.2015](https://web.archive.org/web/20150211000751/http://www.objectmentor.com/resources/articles/lsp.pdf)\n- [The Interface Segregation Principle - objectmentor.com 10.02.2015](https://web.archive.org/web/20150210224002/http://www.objectmentor.com/resources/articles/isp.pdf)\n- [The Dependency Inversion Principle: objectmentor.com 10.02.2015](https://web.archive.org/web/20150210213530/http://www.objectmentor.com/resources/articles/dip.pdf)\n- [Design Principles and Design Patterns](https://cds.cern.ch/record/1419478/files/0135974445_TOC.pdf)\n- [Barbara Liskov, Professor at MIT](http://www.pmg.csail.mit.edu/~liskov/)\n- [GRASP: General Responsibility Assignment Software Principles, code-specialist.com](https://code-specialist.com/blog/grasp/)\n- [KISS Principle code-specialist.com](https://code-specialist.com/blog/kiss-principle/)\n- [Do one things, code-specialist.com](https://code-specialist.com/blog/do-one-thing/)\n- [Python type hints, code-specialist.com](https://code-specialist.com/python-type-hints/)",
                                "slug": "solid",
                                "publishDate": "2021-03-15",
                                "excerpt": "SOLID Principles – If you are a professional developer, there’s no way around these rules for object-oriented software design.",
                                "createdAt": "2023-04-10T16:37:54.419Z",
                                "updatedAt": "2023-04-10T16:37:54.419Z",
                                "publishedAt": "2023-04-10T16:37:54.385Z",
                                "author": {
                                    "data": {
                                        "id": 4,
                                        "attributes": {
                                            "name": "Yannic Schröer",
                                            "slug": "yannic",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-05-02T15:39:45.245Z",
                                            "publishedAt": "2023-04-10T16:03:39.313Z",
                                            "image": {
                                                "data": {
                                                    "id": 3,
                                                    "attributes": {
                                                        "name": "Unbenannt.PNG",
                                                        "alternativeText": null,
                                                        "caption": null,
                                                        "width": 879,
                                                        "height": 699,
                                                        "formats": {
                                                            "small": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/small_Unbenannt_bb5374b218.PNG",
                                                                "hash": "small_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "small_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 18.44,
                                                                "width": 500,
                                                                "height": 398
                                                            },
                                                            "medium": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/medium_Unbenannt_bb5374b218.PNG",
                                                                "hash": "medium_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "medium_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 29.78,
                                                                "width": 750,
                                                                "height": 596
                                                            },
                                                            "thumbnail": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/thumbnail_Unbenannt_bb5374b218.PNG",
                                                                "hash": "thumbnail_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "thumbnail_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 7.33,
                                                                "width": 196,
                                                                "height": 156
                                                            }
                                                        },
                                                        "hash": "Unbenannt_bb5374b218",
                                                        "ext": ".PNG",
                                                        "mime": "image/png",
                                                        "size": 6.96,
                                                        "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/Unbenannt_bb5374b218.PNG",
                                                        "previewUrl": null,
                                                        "provider": "aws-s3",
                                                        "provider_metadata": null,
                                                        "createdAt": "2023-04-11T08:44:21.712Z",
                                                        "updatedAt": "2023-05-02T14:58:57.730Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        {
                            "id": 17,
                            "attributes": {
                                "title": "GRASP - General Responsibility Assignment Software Principles",
                                "content": "\n## About GRASP\n\nThis collection of **object-oriented design rules** goes back to **Craig\nLarman** and his book **Applying UML and Patterns** from 2004. Larman didn't\ninvent any of these principles and ideas. He simply collected them.\n\n**GRASP** is a pretty fancy name, but it somehow feels more like he wanted GRASP\nas the acronym and linked random words to reach it. Even though it is about to\nbecome an oldie, most rules collected under the GRASP banner are still helpful,\nand they should be essential to every developer's toolkit.\n\nThe **General Responsibility Assignment Software Principles** list nine\nprinciples:\n\n1. Controller\n2. Creator\n3. Indirection\n4. Information Expert\n5. Low Coupling\n6. High Cohesion\n7. Polymorphism\n8. Protected Variations\n9. Pure Fabrication.\n\nThough they are tailored to object-oriented design, some also apply for general\nsoftware development as well.\n\nI write about some things that are not from Larman's book but my own opinion and\npersonal note. If you don't want the unaltered version, I suggest you read the\noriginal book: _Applying UML and Patterns: An Introduction to Object-Oriented\nAnalysis and Design and Iterative Development_\n\n## Controller\n\nThe controller pattern is a common tool in object-oriented software design.\nThough most people might only associate the controller with the ancient\narchitecture of the MVC (Model-View-Controller - Which is far too often used for\ncases it absolutely doesn't fit, but that's a story for a different day), the\ncontroller is a construct of itself.\n\nAs the name implies, the controller's work is to 'control' any events that are\nnot directly related to the user interface. But controlling does not mean\nimplementing. The controller consists of barely any logic. It is merely a\nmediator between the presentation layer and the (core) logic.\n\nFor example, if we imagine a simple web-shop application with the use case of\n\"User X bought item A\"; The controller's job would be to receive the signal of\nthe pressed button from the UI and then run the necessary functions in the\ncorrect order. In the example at hand that could be to certify the payment and\nthen initialize the shipment of the item.\n\nApplying the principle of a controller can hugely improve your software's\nlifetime as it naturally creates a resilient layer regarding the\ninterchangeability of code. If your UI or logic (unlikely, but possible), you\ncan adjust your mappings instead of having to rewrite large chunks of code.\n\nAlso, it becomes incredibly easier to add other layers, such as an app at the\noverlaying presentation layer that uses a different UI but wants the same\nresponses.\n\nYou can also think of a controller as a driver. It knows both parts it connects\nwith one another but it acts merely as a broker. It consists of just a few and\nessential parts of code.\n\n## Creator\n\nThe creator is another pattern, but to me, it's more like an abstract idea than\na real pattern. I must admit I rarely use this pattern intentionally.\n\nA creator is a class that is responsible for creating instances of objects.\nLarman defines the following cases as _B is the creator of A_:\n\n- B _aggregates_ A objects\n- B _contains_ A objects\n- B _records_ instances of A objects\n- B _closely uses_ A Objects\n- B _has the initializing_ data that will be passed to A when it is created\n\nSo an example for a creator could be a library that _contains_ books. In that\ncase, the library would be the creator of books, even though this sounds\nsyntactically weird as natural language.\n\n## Indirection\n\nIndirection isn't a pattern but an idea. It is also of no use of its own, only\nin combination with other ideas such as low coupling. The goal behind\nindirection is to avoid direct coupling.\n\nTo pick up an earlier example the controller for example is a kind of\nindirection between the UI and the logic. Instead of coupling the UI directly to\nthe logic, the controller decouples this layer and thereby comes with all the\nadvantages of indirection.\n\n## Information Expert\n\nAnother principle that falls into that area is the information expert. Sometimes\nit is just called the expert or the expert principle. The problem that should be\nsolved with the information expert is the delegation of responsibilities. The\ninformation expert is a class that contains all the information necessary to\ndecide where responsibilities should be delegated to.\n\nYou identify the information expert by analyzing which information is required\nto fulfill a certain job and determining where the most of this information is\nstored.\n\n## Low Coupling\n\nLow or loose coupling is the idea of creating very few links between modules. In\nGRASP it is an inter-module concept. Meaning it describes the flow between\ndifferent modules, not the flow inside the modules.\n\nTogether with cohesion, it is the main reason upon which you make global design\ndecisions such as \"Where do we pack this module or function to?\".\n\nLow coupling is another concept that supports interchangeability. By making very\nfew dependencies, very few code must be changed in case of a change.\n\n## High Cohesion\n\nin GRASP high (functional) cohesion is an intra-module concept. Meaning it\ndescribes the flow inside a certain module not the flow between modules.\n\nThe main reason behind high cohesion is the idea of reducing complexity. Instead\nof building large classes that have many functions that have few in common and\nare hard to maintain, the goal should be to create classes that fit exactly\ntheir defined purpose.\n\nIt's kind of hard to understand these abstract ideas but I also wasn't able to\ncome up with a simple example, which is why I will write an extra article on the\ntopic of low cohesion combined with high cohesion that is more detailed.\n\n## Polymorphism\n\nPolymorphism: `πολυ` (_polús_)= many/multi, `μορφή` (_morphé_) = shape/form,\n`ισμός` (_ismós_) = imitation of.\n\nMeaning, Polymorphism could be frankly translated as \"something that imitates\nmany forms\". And that might be a concise but useless explanation to someone who\nhas never heard of polymorphism.\n\nAnyone who ever took a programming class is most likely familiar with\npolymorphism. But, it can be a tricky question to define it sensefully.\n\nThe idea again is to reduce complexity by imagining that objects follow simple\nand similar rules. Consider the following example: You have three objects A, B\nand C. B has the same methods and attributes but has an additional method X. C\nhas the same methods and attributes as B, but an additional method Y.\n\nThe non-developer approach to this problem would be: \"Great, as you said, we\nhave 3 objects, so we have A, B, and C. Problem solved. You little stinky\nmoron.\". Yes, non-developers are insanely evil creatures.\n\n![Three objects without polymorphism](/assets/blog/posts/grasp/polymorphism_wrong.svg)\n\n```python\nclass A:\n    attribute_a: str\n    attribute_b: int\n    attribute_c: float\n\n    def being_useless(self):\n        print(\"I am being of no use.\")\n\n\nclass B:\n    attribute_a: str\n    attribute_b: int\n    attribute_c: float\n\n    def being_useless(self):\n        print(\"I am being of no use.\")\n\n    def X(self):\n        print(\"I am Batman.\")\n\n\nclass C:\n    attribute_a: str\n    attribute_b: int\n    attribute_c: float\n\n    def being_useless(self):\n        print(\"I am being of no use.\")\n\n    def X(self):\n        print(\"I am Batman.\")\n\n    def Y(self):\n        print(\"I am expensive to my parents.\")\n```\n\nBut as a programmer, you instinctively know that we need the concept of\ninheritance here. A is an object, B is an object that inherits from A, and C is\nan object that inherits from B. **Caution: Inheritance is not polymorphism** -\ninheritance is an application that is allowed due to polymorphism.\n\n![Simple polymorphism example - Venn\ndiagram](/assets/blog/posts/grasp/polymorphism_correct.svg)\n\n```python\nclass A:\n    attribute_a: str\n    attribute_b: int\n    attribute_c: float\n\n    def being_useless(self):\n        print(\"I am being of no use.\")\n\n\nclass B(A):\n\n    def X(self):\n        print(\"I am Batman.\")\n\n\nclass C(B):\n\n    def Y(self):\n        print(\"I am expensive to my parents.\")\n```\n\nTo wrap it up: polymorphism is the concept of disassembling objects and ideas\ninto their most atomic elements and abstracting their commonalities to build\nobjects that can act like they were others. Not only to reduce complexity but\nalso to avoid repetitions.\n\n## Protected Variations\n\nThe protected variations pattern is a pattern used to create a stable\nenvironment around an unstable problem. You wrap the functionality of a certain\nelement (class, interfaces, whatever) with an interface to then create multiple\nimplementations by using the concept of polymorphism. Thereby you are able to\ncatch specific instabilities with specific handlers.\n\nAn example of the protected variations pattern is working with sensory data,\nsuch as a DHT22, a common temperature and humidity sensor often used for\nRaspberry Pi or Arduino). The sensor is doing its job pretty well, but sometimes\nit will say the temperature just rose by 200 celsius or won't return any data at\nall. These are cases you should catch using the protected variations pattern to\navoid false behavior of your program.\n\n## Pure Fabrication\n\nTo reach low coupling and high cohesion, it is sometimes necessary to have pure\nfabrication code and classes. What is meant by that is that this is code that\ndoes not solve a certain real-world problem besides ensuring low coupling and\nhigh cohesion. This is often achieved by using factor classes.\n\n## Some last words\n\nOften when I look into programming principles, I feel mildly overwhelmed and\ndiscouraged. That's in part because some of these concepts are very hard to\n**grasp** if you never heard of them or got no practical use case in mind. But\nwith a growing set of programming principles and best practices, you will see\nthat all these principles refer to the same key statements and follow the same\nrules.\n\nUnfortunately, in my opinion, there's also no substitution for learning it the\nhard way. Memorizing merely the key statements will eventually lead to greater\nschool and university scores, but it will still be useless incoherent\ninformation without any practical use. Thereby, my advice is to learn as much as\npossible about code and its principles but also get as much hands-on experience\nas possible to abstract the key statements by yourself.\n\nIf you liked this post or are of any different opinion regarding any of the\nwritten, please let us know via mail or comment. Happy coding!\n",
                                "slug": "grasp",
                                "publishDate": "2021-01-31",
                                "excerpt": "GRASP is an acronym for General Responsibility Assignment Software Principles. In this article, we want to point out these principles and how they work.",
                                "createdAt": "2023-04-10T16:44:18.210Z",
                                "updatedAt": "2023-04-10T16:44:18.210Z",
                                "publishedAt": "2023-04-10T16:44:18.204Z",
                                "author": {
                                    "data": {
                                        "id": 4,
                                        "attributes": {
                                            "name": "Yannic Schröer",
                                            "slug": "yannic",
                                            "createdAt": "2023-04-10T16:03:39.315Z",
                                            "updatedAt": "2023-05-02T15:39:45.245Z",
                                            "publishedAt": "2023-04-10T16:03:39.313Z",
                                            "image": {
                                                "data": {
                                                    "id": 3,
                                                    "attributes": {
                                                        "name": "Unbenannt.PNG",
                                                        "alternativeText": null,
                                                        "caption": null,
                                                        "width": 879,
                                                        "height": 699,
                                                        "formats": {
                                                            "small": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/small_Unbenannt_bb5374b218.PNG",
                                                                "hash": "small_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "small_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 18.44,
                                                                "width": 500,
                                                                "height": 398
                                                            },
                                                            "medium": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/medium_Unbenannt_bb5374b218.PNG",
                                                                "hash": "medium_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "medium_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 29.78,
                                                                "width": 750,
                                                                "height": 596
                                                            },
                                                            "thumbnail": {
                                                                "ext": ".PNG",
                                                                "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/thumbnail_Unbenannt_bb5374b218.PNG",
                                                                "hash": "thumbnail_Unbenannt_bb5374b218",
                                                                "mime": "image/png",
                                                                "name": "thumbnail_Unbenannt.PNG",
                                                                "path": null,
                                                                "size": 7.33,
                                                                "width": 196,
                                                                "height": 156
                                                            }
                                                        },
                                                        "hash": "Unbenannt_bb5374b218",
                                                        "ext": ".PNG",
                                                        "mime": "image/png",
                                                        "size": 6.96,
                                                        "url": "https://code-specialist-blog.s3.eu-central-1.amazonaws.com/Unbenannt_bb5374b218.PNG",
                                                        "previewUrl": null,
                                                        "provider": "aws-s3",
                                                        "provider_metadata": null,
                                                        "createdAt": "2023-04-11T08:44:21.712Z",
                                                        "updatedAt": "2023-05-02T14:58:57.730Z"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        }
    ],
    "meta": {
        "pagination": {
            "page": 1,
            "pageSize": 25,
            "pageCount": 1,
            "total": 5
        }
    }
}