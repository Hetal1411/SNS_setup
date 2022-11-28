module.exports = {
    friendlyName: 'Change device token and type',
    description: '',
    inputs: {
        deviceType: {
            type: 'string',
            required: true,
            isIn: ['iOS', 'Android'],
            description: 'User device type'
        },
        deviceToken: {
            type: 'string',
            required: true,
            description: 'User device token'
        }
    },
    exits: {

    },
    fn: async function (inputs, exits) {
        var req = this.req;
        var res = this.res;
        inputs.id = req.loggedInUser.id;

        var createArnRes = null;
        var endpointArn = '';
        var snsTopicSubscriptionArn = '';
        var topicSubscribeRes = null;

        var userDataObj = await User.findOne({ id: inputs.id });
        if (!userDataObj) {
            return res.notFound({ message: sails.__('User record not found') });
        }

        // delete other user endpoint arn with same token
        var usersWithSameTokenRes = await User.find({ deviceToken: inputs.deviceToken, id: { '!=': inputs.id } });
        var usersWithSameTokenResLength = usersWithSameTokenRes.length;
        if (usersWithSameTokenResLength) {
            for (var i = 0; i < usersWithSameTokenResLength; i++) {
                var usersWithSameToken = usersWithSameTokenRes[i];
                if (usersWithSameToken.snsEndPointArn) {
                    await sails.helpers.push.topicUnsubscribe(usersWithSameToken.snsTopicSubscriptionArn);
                    await sails.helpers.push.deleteArn(usersWithSameToken.snsEndPointArn);
                }
            }
            var nullDeviceTokenDetails = { deviceToken: '', snsEndPointArn: '', snsTopicSubscriptionArn: '' };
            var clearUserTokenDetailRes = await User.update({ deviceToken: inputs.deviceToken }).set(nullDeviceTokenDetails);
        }

        if (userDataObj.snsEndPointArn && userDataObj.deviceToken !== inputs.deviceToken) {
            /* Replace with new token */
            // console.log('/* Replace with new token */');
            await sails.helpers.push.topicUnsubscribe(userDataObj.snsTopicSubscriptionArn);
            await sails.helpers.push.deleteArn(userDataObj.snsEndPointArn);

            // createPlatformEndpoint
            createArnRes = await sails.helpers.push.createArn(inputs.deviceType, inputs.deviceToken, userDataObj.email);
            endpointArn = createArnRes.endpointArn;

            // subscribe to endpoint arn
            topicSubscribeRes = await sails.helpers.push.topicSubscribe(inputs.deviceType, endpointArn);
            if (topicSubscribeRes.status === true && topicSubscribeRes.data) {
                snsTopicSubscriptionArn = topicSubscribeRes.data.SubscriptionArn;
            }

            // update token & end point
            await User.update({ id: inputs.id }, { snsEndPointArn: endpointArn, snsTopicSubscriptionArn: snsTopicSubscriptionArn, deviceType: inputs.deviceType, deviceToken: inputs.deviceToken }).fetch();
        } else if (!userDataObj.snsEndPointArn) {
            /* Generate new token */
            // console.log('/* Generate new token */');

            // createPlatformEndpoint
            createArnRes = await sails.helpers.push.createArn(inputs.deviceType, inputs.deviceToken, userDataObj.email);
            endpointArn = createArnRes.endpointArn;

            // subscribe to endpoint arn
            topicSubscribeRes = await sails.helpers.push.topicSubscribe(inputs.deviceType, endpointArn);
            if (topicSubscribeRes.status === true && topicSubscribeRes.data) {
                snsTopicSubscriptionArn = topicSubscribeRes.data.SubscriptionArn;
            }

            // update token & end point
            await User.update({ id: inputs.id }, { snsEndPointArn: endpointArn, snsTopicSubscriptionArn: snsTopicSubscriptionArn, deviceType: inputs.deviceType, deviceToken: inputs.deviceToken }).fetch();
        } else {
            // console.log('/* No any need to change with token */');
        }

        return exits.success({
            message: sails.__('Device token changed successfully'),
            // temp: {
            //     usersWithSameTokenRes: usersWithSameTokenRes
            // }
        });
    }
};
