module.exports = {
    friendlyName: 'Topic subscribe',
    description: '',
    inputs: {
        deviceType: {
            type: 'string',
            example: 'iOS',
            isIn: ['iOS', 'Android'],
            description: 'device type',
            required: true
        },
        endpointArn: {
            type: 'string',
            example: 'af34fsdf4asdrg34tfrsdfg',
            description: 'endpoint arn',
            required: false,
            allowNull: true
        },
    },
    exits: {

    },
    fn: async function (inputs, exits) {
        if (!inputs.endpointArn) {
            return exits.success({
                status: false,
                err: null
            });
        }

        var topicArn = '';
        if (inputs.deviceType === 'iOS') {
            topicArn = sails.config.SNS.ARN_IOS_TOPIC;
        } else if (inputs.deviceType === 'Android') {
            topicArn = sails.config.SNS.ARN_ANDROID_TOPIC;
        }

        var params = {
            Protocol: 'application', /* required */
            TopicArn: topicArn, /* required */
            Endpoint: inputs.endpointArn
        };
        var sns = sails.config.globals.AWS_SNS;
        sns.subscribe(params, (err, data) => {
            return exits.success({
                status: (err ? false : true),
                err: err,
                data: data
            });
        });
    }
};
