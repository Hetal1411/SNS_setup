module.exports = {
    friendlyName: "Create arn",
    description: "",
    inputs: {
        usertype: {
            type: "string",
            example: "user",
            isIn: ["customer", "stylist"],
            description: "customer/stylist",
            required: true
        },
        devicetype: {
            type: "string",
            example: "iOS",
            isIn: ["iOS", "Android"],
            description: "device type",
            required: true
        },
        devicetoken: {
            type: "string",
            example: "af34fsdf4asdrg34tfrsdfg",
            description: "device token",
            required: true
        },        
        email: {
            type: "string",
            example: "email",
            description: "user email",
            required: true
        }
    },
    exits: {

    },
    fn: async function (inputs, exits) {
        var AWS = require('aws-sdk');
        AWS.config.update({
            accessKeyId: sails.config.SNS.AWS_KEY,
            secretAccessKey: sails.config.SNS.AWS_SECRET,
            region: sails.config.SNS.SNS_REGION
          });
        
        var sns = new AWS.SNS();
        // var sns = global.sns;

        var platformApplicationArnStr = "";
        if (inputs.usertype == 'customer') {
            if (inputs.devicetype == 'iOS') {
                platformApplicationArnStr = sails.config.SNS.ARN_Ios_Customer;
            } else {
                platformApplicationArnStr = sails.config.SNS.ARN_Android_Customer;
            }
        } else {
            if (inputs.devicetype == 'iOS') {
                platformApplicationArnStr = sails.config.SNS.ARN_Ios_Stylist;
            } else {
                platformApplicationArnStr = sails.config.SNS.ARN_Android_Stylist;
            }
        }

        sns.createPlatformEndpoint({
            PlatformApplicationArn: platformApplicationArnStr,
            Token: inputs.devicetoken,
            CustomUserData: inputs.email,
            Attributes: {
                Enabled: 'true',
            },
        }, function (createPlatformEndpointErr, createPlatformEndpointRes) {
            if (createPlatformEndpointErr) {
                return exits.error(new Error(createPlatformEndpointErr.message));
            }
            var endpointArn = createPlatformEndpointRes.EndpointArn
            return exits.success({
                endpointArn: endpointArn,
            });
        });
    }
};