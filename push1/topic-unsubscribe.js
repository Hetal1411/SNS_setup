module.exports = {
    friendlyName: 'Topic unsubscribe',
    description: '',
    inputs: {
        snsTopicSubscriptionArn: {
            type: 'string',
            example: 'af34fsdf4asdrg34tfrsdfg',
            description: 'sns topic sub-scription arn',
            required: false,
            allowNull: true
        },
    },
    exits: {

    },
    fn: async function (inputs, exits) {
        if (!inputs.snsTopicSubscriptionArn) {
            return exits.success({
                status: false,
                err: null
            });
        }

        var params = {
            SubscriptionArn: inputs.snsTopicSubscriptionArn /* required */
        };
        var sns = sails.config.globals.AWS_SNS;
        sns.unsubscribe(params, (err, data) => {
            return exits.success({
                status: (err ? false : true),
                err: err,
                data: data
            });
        });
    }
};
