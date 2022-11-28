module.exports = {
    friendlyName: 'Topic unsubscribe',
    description: '',
    inputs: {
        snstopicscriptionarn: {
            type: "string",
            example: "af34fsdf4asdrg34tfrsdfg",
            description: "sns topic scription arn",
            required: false
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

        if(!inputs.snstopicscriptionarn){
            return exits.success({
                status: false,
                err: null
            });
        }

        var params = {
            SubscriptionArn: inputs.snstopicscriptionarn /* required */
        };
        sns.unsubscribe(params, function (err, data) {
            return exits.success({
                status: (err ? false : true),
                err: err,
                data: data
            });
        });
    }
};