module.exports = {
    friendlyName: "Send push",
    description: "",
    inputs: {
        title: {
            type: "string",
            required: false,
            description: "User device token",
        },
        message: {
            type: "string",
            required: true,
            description: "AWS ARN id",
        },
        endpointArn: {
            type: "string",
            required: false,
            description: "User device token",
        },
    },
    exits: {

    },
    fn: async function (inputs, exits) {
        var message = inputs.message;
        var titleNotification = inputs.title;
        var endpointArn = inputs.endpointArn;

        var AWS = require('aws-sdk');
        AWS.config.update({
            accessKeyId: sails.config.SNS.AWS_KEY,
            secretAccessKey: sails.config.SNS.AWS_SECRET,
            region: sails.config.SNS.SNS_REGION
        });

        var sns = new AWS.SNS();


        if (!endpointArn) {
            return exits.success({
                status: false,
                message: "end-point-arn blank",
                errorcode: "",
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
                    sound: "default",
                    badge: 1,
                    action: message,
                },
            },
            APNS: {
                aps: {
                    alert: {
                        title: titleNotification,
                        body: message,
                    },
                    sound: "default",
                    badge: 1,
                    action: message,
                },
            },
            GCM: {
                data: {
                    message: message,
                    sound: "default",
                    badge: 1,
                    action: message,
                },
            },
        };

        // first have to stringify the inner APNS object...
        payload.APNS = JSON.stringify(payload.APNS);
        payload.APNS_SANDBOX = JSON.stringify(payload.APNS_SANDBOX);
        payload.GCM = JSON.stringify(payload.GCM);
        payload = JSON.stringify(payload);

        sns.publish({
            Message: payload,
            MessageStructure: "json",
            TargetArn: endpointArn,
        }, async function (snsPublishErr, snsPublishData) {
            if (snsPublishErr) {
                // sails.log("Notification Error: 1 : message: ", snsPublishErr.message, ", code: ", snsPublishErr.code);

                if (snsPublishErr.code == "EndpointDisabled") {
                    var enableArnRes = await sails.helpers.push.enableArn(endpointArn);
                    sns.publish({
                        Message: payload,
                        MessageStructure: "json",
                        TargetArn: endpointArn,
                    }, async function (snsPublishErr, snsPublishData) {
                        if (snsPublishErr) {
                            // sails.log("Notification Error: 2 : message: ", snsPublishErr.message, ", code: ", snsPublishErr.code);
                            return exits.success({
                                status: false,
                                message: snsPublishErr.message,
                                errorcode: snsPublishErr.code,
                            });
                        } else {
                            return exits.success({
                                status: true,
                                message: snsPublishData,
                                errorcode: "",
                            });
                        }
                    });
                } else {
                    return exits.success({
                        status: false,
                        message: snsPublishErr.message,
                        errorcode: snsPublishErr.code,
                    });
                }
            } else {
                return exits.success({
                    status: true,
                    message: snsPublishData,
                    errorcode: "",
                });
            }
        });
    },
};