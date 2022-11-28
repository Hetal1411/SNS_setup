module.exports = {
    friendlyName: 'Topic subscribe',
    description: '',
    inputs: {
        usertype: {
            type: "string",
            example: "user",
            isIn: ["customer", "stylist"],
            description: "user/driver",
            required: true
        },
        devicetype: {
            type: "string",
            example: "iOS",
            isIn: ["iOS", "Android"],
            description: "device type",
            required: true
        },
        endpointarn: {
            type: "string",
            example: "af34fsdf4asdrg34tfrsdfg",
            description: "endpoint arn",
            required: false
        },
    },
    exits: {

    },
    fn: async function (inputs, exits) {
        // inputs.usertype, inputs.devicetype, inputs.endpointarn
        var AWS = require('aws-sdk');
        AWS.config.update({
            accessKeyId: sails.config.SNS.AWS_KEY,
            secretAccessKey: sails.config.SNS.AWS_SECRET,
            region: sails.config.SNS.SNS_REGION
          });
        var sns = new AWS.SNS();

        if(!inputs.endpointarn){
            return exits.success({
                status: false,
                err: null
            });
        }

        var topicArn = '';
        if (inputs.usertype == 'customer') {
            if (inputs.devicetype == 'iOS') {
                topicArn = sails.config.SNS.ARN_Ios_Topic_Customer;
            } else if (inputs.devicetype == 'Android') {
                topicArn = sails.config.SNS.ARN_Android_Topic_Customer;
            }
        } else if (inputs.usertype == 'stylist') {
            if (inputs.devicetype == 'iOS') {
                topicArn = sails.config.SNS.ARN_Ios_Topic_Stylist;
            } else if (inputs.devicetype == 'Android') {
                topicArn = sails.config.SNS.ARN_Android_Topic_Stylist;
            }
        }

        var params = {
            Protocol: 'application', /* required */
            TopicArn: topicArn, /* required */
            Endpoint: inputs.endpointarn
        };
        sns.subscribe(params, function (err, data) {
            return exits.success({
                status: (err ? false : true ),
                err: err,
                data: data
            });
        });
    }
};