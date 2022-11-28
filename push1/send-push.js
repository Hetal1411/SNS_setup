module.exports = {
    friendlyName: 'Send push',
    description: '',
    inputs: {
        title: {
            type: 'string',
            required: false,
            allowNull: true,
            defaultsTo: '',
            description: 'notification title',
        },
        message: {
            type: 'string',
            required: false,
            allowNull: true,
            defaultsTo: '',
            description: 'message or body describe',
        },
        notificationAction: {
            type: 'string',
            required: false,
            allowNull: true,
            defaultsTo: '',
            description: 'notification action',
        },
        endpointArn: {
            type: 'string',
            required: false,
            allowNull: true,
            description: 'AWS SNS plateform end-point arn',
        },
        typeOfSend: {
            type: 'string',
            required: false,
            isIn: ['now', 'queue'],
            defaultsTo: 'queue'
        },
        otherData: {
            type: 'json',
            columnType: 'array',
            defaultsTo: [],
            required: false,
        },
        // extraData:{
        //     type: 'string',
        //     columnType: 'mediumtext',
        //     required: false
        // },
    },
    exits: {

    },
    fn: async function (inputs, exits) {
        if (!inputs.endpointArn) {
            return exits.success({
                status: false,
                message: sails.__('EndpointArn not available')
            });
        }
        if (inputs.typeOfSend === 'queue') {
            Jobs.create('sendPushNotification', {
                inputs: inputs
            }).save((err) => {
                if (err) {
                    return exits.success({
                        status: false,
                        message: err.message
                    });
                }
                return exits.success({
                    status: true,
                    message: sails.__('Push notification job dispatch successfully')
                });
            });
        } else {
            var message = inputs.message;
            var titleNotification = inputs.title;
            var endpointArn = inputs.endpointArn;
            var sns = sails.config.globals.AWS_SNS;
            var notificationAction = inputs.notificationAction;
            var otherData = (inputs.otherData ? inputs.otherData : null);

            if (!endpointArn) {
                return exits.success({
                    status: false,
                    message: 'end-point-arn blank'
                });
            }

            var payload = {
                default: message,

                APNS_SANDBOX: {
                    aps: {
                        alert: {
                            title: titleNotification,
                            body: message,
                        },
                        sound: 'default',
                        badge: 1,
                        action: message,
                        extra: {
                            notificationAction: notificationAction
                        }
                    },
                },
                APNS: {
                    aps: {
                        alert: {
                            title: titleNotification,
                            body: message,
                        },
                        sound: 'default',
                        badge: 1,
                        action: message,
                        extra: {
                            notificationAction: notificationAction
                        }
                    },
                },
                GCM: {
                    data: {
                        body: message,
                        message: message,
                        title: titleNotification,
                        sound: 'default',
                        badge: 1,
                        action: notificationAction,
                        extra: {
                            notificationAction: notificationAction
                        }
                    },
                    notification: {
                        body: message,
                        message: message,
                        title: titleNotification,
                        sound: 'default',
                        badge: 1,
                        action: notificationAction,
                        extra: {
                            notificationAction: notificationAction
                        }
                    },
                },
            };

            // console.log('payload', payload);

            // first have to stringify the inner APNS object...
            payload.APNS = JSON.stringify(payload.APNS);
            payload.APNS_SANDBOX = JSON.stringify(payload.APNS_SANDBOX);
            payload.GCM = JSON.stringify(payload.GCM);
            payload = JSON.stringify(payload);

            // console.log('payload ::', payload);
            sns.publish({
                Message: payload,
                MessageStructure: 'json',
                TargetArn: endpointArn,
            }, async (snsPublishErr, snsPublishData) => {
                if (snsPublishErr) {
                    console.log('Notification Error: 1 : message: ', snsPublishErr.message, ', code: ', snsPublishErr.code);

                    if (snsPublishErr.code === 'EndpointDisabled') {
                        var enableArnRes = await sails.helpers.push.enableArn(endpointArn);
                        sns.publish({
                            Message: payload,
                            MessageStructure: 'json',
                            TargetArn: endpointArn,
                        }, async (snsPublishErr, snsPublishData) => {
                            if (snsPublishErr) {
                                console.log('Notification Error: 2 : message: ', snsPublishErr.message, ', code: ', snsPublishErr.code);
                                return exits.success({
                                    status: false,
                                    message: snsPublishErr.message
                                });
                            } else {
                                return exits.success({
                                    status: true,
                                    message: snsPublishData
                                });
                            }
                        });
                    } else {
                        return exits.success({
                            status: false,
                            message: snsPublishErr.message
                        });
                    }
                } else {
                    console.log('send', snsPublishData);

                    return exits.success({
                        status: true,
                        message: snsPublishData
                    });
                }
            });
        }
    },
};
