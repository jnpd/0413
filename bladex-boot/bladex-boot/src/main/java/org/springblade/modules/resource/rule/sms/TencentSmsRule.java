/**
 * BladeX Commercial License Agreement
 * Copyright (c) 2018-2099, https://bladex.cn. All rights reserved.
 * <p>
 * Use of this software is governed by the Commercial License Agreement
 * obtained after purchasing a license from BladeX.
 * <p>
 * 1. This software is for development use only under a valid license
 * from BladeX.
 * <p>
 * 2. Redistribution of this software's source code to any third party
 * without a commercial license is strictly prohibited.
 * <p>
 * 3. Licensees may copyright their own code but cannot use segments
 * from this software for such purposes. Copyright of this software
 * remains with BladeX.
 * <p>
 * Using this software signifies agreement to this License, and the software
 * must not be used for illegal purposes.
 * <p>
 * THIS SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY. The author is
 * not liable for any claims arising from secondary or illegal development.
 * <p>
 * Author: Chill Zhuang (bladejava@qq.com)
 */
package org.springblade.modules.resource.rule.sms;

import com.tencentcloudapi.common.Credential;
import com.tencentcloudapi.sms.v20210111.SmsClient;
import org.springblade.core.literule.annotation.LiteRuleComponent;
import org.springblade.core.literule.core.RuleComponent;
import org.springblade.core.redis.cache.BladeRedis;
import org.springblade.core.sms.SmsTemplate;
import org.springblade.core.sms.TencentSmsTemplate;
import org.springblade.core.sms.props.SmsProperties;
import org.springblade.modules.resource.pojo.entity.Sms;
import org.springblade.modules.resource.rule.context.SmsContext;

import static org.springblade.modules.resource.rule.constant.SmsRuleConstant.TENCENT_SMS_RULE;

/**
 * 腾讯云短信构建类
 *
 * @author Chill
 */
@LiteRuleComponent(id = TENCENT_SMS_RULE, name = "腾讯SMS构建")
public class TencentSmsRule extends RuleComponent {

	@Override
	public void process() {
		// 获取上下文
		SmsContext contextBean = this.getContextBean(SmsContext.class);
		Sms sms = contextBean.getSms();
		BladeRedis bladeRedis = contextBean.getBladeRedis();

		SmsProperties smsProperties = new SmsProperties();
		smsProperties.setTemplateId(sms.getTemplateId());
		smsProperties.setAccessKey(sms.getAccessKey());
		smsProperties.setSecretKey(sms.getSecretKey());
		smsProperties.setAppId(sms.getAppId());
		smsProperties.setRegionId(sms.getRegionId());
		smsProperties.setSignName(sms.getSignName());

		Credential cred = new Credential(smsProperties.getAccessKey(), smsProperties.getSecretKey());
		SmsClient client = new SmsClient(cred, smsProperties.getRegionId());
		SmsTemplate smsTemplate = new TencentSmsTemplate(smsProperties, client, bladeRedis);

		// 设置上下文
		contextBean.setSmsTemplate(smsTemplate);

	}
}
