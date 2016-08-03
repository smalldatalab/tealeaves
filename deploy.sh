#!/bin/bash

ember build --environment=production
ssh -i ~/.ssh/eaf-related.pem ec2-user@tealeaves.smalldata.io <<< "rm -rf /var/www/tealeaves/dist"
scp -r -i ~/.ssh/eaf-related.pem dist ec2-user@tealeaves.smalldata.io:/var/www/tealeaves
