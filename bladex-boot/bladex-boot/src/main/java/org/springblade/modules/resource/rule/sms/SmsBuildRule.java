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

import org.springblade.core.literule.annotation.LiteRuleComponent;
import org.springblade.core.literule.core.RuleSwitchComponent;
import org.springblade.core.log.exception.ServiceException;
import org.springblade.core.sms.enums.SmsEnum;
import org.springblade.modules.resource.pojo.entity.Sms;
import org.springblade.modules.resource.rule.context.SmsContext;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.springblade.modules.resource.rule.constant.SmsRuleConstant.SMS_BUILD_RULE;

/**
 * Sms构建判断
 *
 * @author Chill
 */
@LiteRuleComponent(id = SMS_BUILD_RULE, name = "SMS构建条件判断")
public class SmsBuildRule extends RuleSwitchComponent {

	private static final Map<Integer, String> CATEGORY_RULE_MAP = new HashMap<>();

	static {
		CATEGORY_RULE_MAP.put(SmsEnum.YUNPIAN.getCategory(), "yunpianSmsRule");
		CATEGORY_RULE_MAP.put(SmsEnum.QINIU.getCategory(), "qiniuSmsRule");
		CATEGORY_RULE_MAP.put(SmsEnum.ALI.getCategory(), "aliSmsRule");
		CATEGORY_RULE_MAP.put(SmsEnum.TENCENT.getCategory(), "tencentSmsRule");
	}

	@Override
	public List<String> process() {
		SmsContext contextBean = this.getContextBean(SmsContext.class);
		if (contextBean.getIsCached()) {
			return Collections.singletonList("cacheSmsRule");
		}
		Sms sms = contextBean.getSms();
		String ruleName = CATEGORY_RULE_MAP.get(sms.getCategory());
		if (ruleName != null) {
			return Collections.singletonList(ruleName);
		}
		throw new ServiceException("未找到SMS配置");
	}
}
