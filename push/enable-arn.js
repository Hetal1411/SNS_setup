module.exports = {
    friendlyName: "Enable arn",
    description: "",
    inputs: {
        endpointArn: {
            type: "string",
            required: true,
            description: "User device token",
        },
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
        var endpointArn = inputs.endpointArn;

        var params = {
            EndpointArn: endpointArn,
            Attributes: {
                Enabled: "true",
            },
        };

        sns.setEndpointAttributes(params, function (setEndpointAttributesErr, setEndpointAttributesRes) {
            if (setEndpointAttributesErr) {
                // sails.log("Enable endpoint error: ", setEndpointAttributesErr);
            }
            return exits.success({
                message: "End point enable success",
                status: true
            });
        });
    }
};