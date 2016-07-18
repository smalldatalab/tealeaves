#!/bin/bash

ember build --environment=production
scp -r -i ~/.ssh/eaf-related.pem dist ec2-user@tealeaves.smalldata.io:/var/www/tealeaves
