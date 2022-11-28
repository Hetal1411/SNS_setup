module.exports = {
    friendlyName: 'Create arn',
    description: '',
    inputs: {
        deviceType: {
            type: 'string',
            example: 'iOS',
            isIn: ['iOS', 'Android'],
            description: 'device type',
            required: true
        },
        deviceToken: {
            type: 'string',
            example: 'af34fsdf4asdrg34tfrsdfg',
            description: 'device token',
            required: true
        },
        email: {
            type: 'string',
            example: 'email',
            description: 'user email',
            required: true
        }
    },
    exits: {

    },
    fn: async function (inputs, exits) {
        var sns = sails.config.globals.AWS_SNS;

        var platformApplicationArnStr = '';
        if (inputs.deviceType === 'iOS') {
            platformApplicationArnStr = sails.config.SNS.ARN_IOS_PLATFORM_APPLICATION;
        } else {
            platformApplicationArnStr = sails.config.SNS.ARN_ANDROID_PLATFORM_APPLICATION;
        }

        sns.createPlatformEndpoint({
            PlatformApplicationArn: platformApplicationArnStr,
            Token: inputs.deviceToken,
            CustomUserData: inputs.email,
            Attributes: {
                Enabled: 'true',
            },
        }, (createPlatformEndpointErr, createPlatformEndpointRes) => {
            if (createPlatformEndpointErr) {
                return exits.error(new Error(createPlatformEndpointErr.message));
            }
            var endpointArn = createPlatformEndpointRes.EndpointArn;
            return exits.success({
                endpointArn: endpointArn,
            });
        });
    }
};
