const AWS = require('aws-sdk');

// Set up AWS S3 client with your AWS access keys
const s3 = new AWS.S3({
  accessKeyId: 'AKIAZ5A3L6PMLBBEKIYA',
  secretAccessKey: '1FpXZoH5U+zAvn7OiXpFUiBwlQICj2BlkS3PLfO1',
});

// Define the S3 bucket name and key for your JSON object
const bucketName = 'betbotv1';
const keyName = 'BetFair.json';

// Define your JSON object
const jsonObject = {
  foo: 'dfd',
  baz: 'qugtestsx'
};

// Stringify your JSON object
const jsonString = JSON.stringify(jsonObject);

// Set up the S3 upload parameters
const params = {
  Bucket: bucketName,
  Key: keyName,
  Body: jsonString,
};

// Upload the JSON object to S3
s3.upload(params, function(err, data) {
  if (err) {
    console.log('Error uploading JSON:', err);
  } else {
    console.log('JSON uploaded successfully:', data.Location);
  }
});