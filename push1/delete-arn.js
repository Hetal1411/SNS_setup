module.exports = {
    friendlyName: 'Delete arn',
    description: '',
    inputs: {
        endPointArn: {
            type: 'string',
            description: 'End point Arn',
            required: true,
        },
    },
    exits: {
        success: {
            description: 'All done.',
        },
    },
    fn: async function (inputs, exits) {
        var sns = sails.config.globals.AWS_SNS;
        var params = {
            EndpointArn: inputs.endPointArn,
        };

        sns.deleteEndpoint(params, (deleteEndpointErr, deleteEndpointRes) => {
            if (deleteEndpointErr) {
                return exits.success(deleteEndpointErr);
            }
            return exits.success(deleteEndpointRes);
        });
    },
};
