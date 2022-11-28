module.exports = {
    friendlyName: 'Enable arn',
    description: '',
    inputs: {
        endpointArn: {
            type: 'string',
            required: true,
            description: 'User device token',
        },
    },
    exits: {

    },
    fn: async function (inputs, exits) {
        var sns = sails.config.globals.AWS_SNS;
        var endpointArn = inputs.endpointArn;

        var params = {
            EndpointArn: endpointArn,
            Attributes: {
                Enabled: 'true',
            },
        };

        sns.setEndpointAttributes(params, (setEndpointAttributesErr, setEndpointAttributesRes) => {
            if (setEndpointAttributesErr) {
                console.log('Enable endpoint error: ', setEndpointAttributesErr);
            }
            return exits.success({
                message: 'End point enable success',
                status: true
            });
        });
    }
};
