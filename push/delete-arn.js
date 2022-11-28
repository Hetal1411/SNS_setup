module.exports = {
    friendlyName: "Delete arn",
    description: "",
    inputs: {
        endPointArn: {
            type: "string",
            description: "End point Arn",
            required: true,
        },
    },
    exits: {
        success: {
            description: "All done.",
        },
    },
    fn: async function(inputs,exits) {
        var AWS = require('aws-sdk');
        AWS.config.update({
            accessKeyId: sails.config.SNS.AWS_KEY,
            secretAccessKey: sails.config.SNS.AWS_SECRET,
            region: sails.config.SNS.SNS_REGION
          });
        
        var sns = new AWS.SNS();
        
        var params = {
            EndpointArn: inputs.endPointArn,
        };

        sns.deleteEndpoint(params, function(deleteEndpointErr, deleteEndpointRes) {
            if (deleteEndpointErr) {
                return exits.success(deleteEndpointErr);
            }
            return exits.success(deleteEndpointRes);
        });
    },
};
