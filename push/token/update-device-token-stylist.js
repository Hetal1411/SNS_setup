module.exports = {


    friendlyName: 'Update device token',


    description: '',


    inputs: {
        deviceType: {
            type: "string",
            // required: true,
            // isIn: ["iOS", "Android"],
            description: "User device type"
        },
        deviceToken: {
            type: "string",
            // required: true,
            description: "User device token"
        },
        req: {
            type: 'ref',
        },
        stylistId: {
            type: "number",
        }
    },


    exits: {

        success: {
            description: 'All done.',
        },

    },


    fn: async function (inputs, exits) {
        // sails.log(inputs);
        var req = inputs.req;
        var res = this.res;
        // sails.log(inputs.stylistId);

        if (inputs.stylistId == undefined) {
            inputs.id = req.isUserLogin.id;
        } else {
            inputs.id = inputs.stylistId;
        }
        // sails.log("input ids :- ",inputs.id);

        var userDataObj = await Stylist.findOne({ id: inputs.id });
        if (!userDataObj) {
            return res.notFound({ message: sails.__('User record not found') });
        }

        // delete other user endpoint arn with same token
        var usersWithSameTokenRes = await Stylist.find({ deviceToken: inputs.deviceToken, id: { '!=': inputs.id } });
        var usersWithSameTokenResStylist = await Stylist.find({ deviceToken: inputs.deviceToken });
        var usersWithSameTokenResLength = usersWithSameTokenRes.length;
        var usersWithSameTokenResStylistLength = usersWithSameTokenRes.length;
        if (usersWithSameTokenResLength) {
            for (var i = 0; i < usersWithSameTokenResLength; i++) {
                var usersWithSameToken = usersWithSameTokenRes[i];
                if (usersWithSameToken.snsEndPointArn) {
                    await sails.helpers.push.topicUnsubscribe(usersWithSameToken.snsTopicScriptionArn);
                    await sails.helpers.push.deleteArn(usersWithSameToken.snsEndPointArn);
                }
            }

            for (var i = 0; i < usersWithSameTokenResStylistLength; i++) {
                var usersWithSameTokenResStylist = usersWithSameTokenResStylist[i];
                if (usersWithSameTokenResStylist.snsEndPointArn) {
                    await sails.helpers.push.topicUnsubscribe(usersWithSameTokenResStylist.snsTopicScriptionArn);
                    await sails.helpers.push.deleteArn(usersWithSameTokenResStylist.snsEndPointArn);
                }
            }

            var nullDeviceTokenDetails = { deviceToken: "", snsEndPointArn: "", snsTopicScriptionArn: "" };
            await Stylist.update({ deviceToken: inputs.deviceToken }).set(nullDeviceTokenDetails);
            await Customer.update({ deviceToken: inputs.deviceToken }).set(nullDeviceTokenDetails);
        }

        if (userDataObj.snsEndPointArn && userDataObj.deviceToken != inputs.deviceToken) {
            /* Replace with new token */
            // sails.log("/* Replace with new token */");
            await sails.helpers.push.topicUnsubscribe(userDataObj.snsTopicScriptionArn);
            await sails.helpers.push.deleteArn(userDataObj.snsEndPointArn);

            // createPlatformEndpoint
            var createArnRes = await sails.helpers.push.createArn('stylist', inputs.deviceType, inputs.deviceToken, userDataObj.email);
            var endpointArn = createArnRes.endpointArn;

            // subscribe to endpoint arn
            var snsTopicScriptionArn = "";
            var topicSubscribeRes = await sails.helpers.push.topicSubscribe('stylist', inputs.deviceType, endpointArn);
            if (topicSubscribeRes.status == true && topicSubscribeRes.data) {
                snsTopicScriptionArn = topicSubscribeRes.data.SubscriptionArn;
            }

            // update token & end point
            await Stylist.update({ id: inputs.id }, { snsEndPointArn: endpointArn, snsTopicScriptionArn: snsTopicScriptionArn, deviceType: inputs.deviceType, deviceToken: inputs.deviceToken }).fetch();
        } else if (!userDataObj.snsEndPointArn) {
            /* Generate new token */
            // sails.log("/* Generate new token */");

            // createPlatformEndpoint
            var createArnRes = await sails.helpers.push.createArn('stylist', inputs.deviceType, inputs.deviceToken, userDataObj.email);
            var endpointArn = createArnRes.endpointArn;

            // subscribe to endpoint arn
            var snsTopicScriptionArn = "";
            var topicSubscribeRes = await sails.helpers.push.topicSubscribe('stylist', inputs.deviceType, endpointArn);
            if (topicSubscribeRes.status == true && topicSubscribeRes.data) {
                snsTopicScriptionArn = topicSubscribeRes.data.SubscriptionArn;
            }

            // update token & end point
            await Stylist.update({ id: inputs.id }, { snsEndPointArn: endpointArn, snsTopicScriptionArn: snsTopicScriptionArn, deviceType: inputs.deviceType, deviceToken: inputs.deviceToken }).fetch();
        } else {
            // sails.log("/* No any need to change with token */");
        }

        return exits.success({
            message: sails.__('Device token changed successfully'),
            // temp: {
            //     usersWithSameTokenRes: usersWithSameTokenRes
            // }
        });
    }


};

