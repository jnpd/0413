package org.springblade.modules.resource.rule.builder;

import org.springblade.core.literule.annotation.RuleEngineComponent;
import org.springblade.core.literule.builder.LiteRule;
import org.springblade.core.literule.builder.RuleBuilder;
import org.springblade.core.literule.builder.chain.RuleChain;

import static org.springblade.modules.resource.rule.constant.SmsRuleConstant.*;

/**
 * Sms规则链构建器
 *
 * @author BladeX
 */
@RuleEngineComponent(id = SMS_CHAIN_ID)
public class SmsRuleBuilder implements RuleBuilder {
	@Override
	public RuleChain build() {
		// 创建SMS构建条件判断规则链
		RuleChain smsBuildRuleChain = LiteRule.SWITCH(SMS_BUILD_RULE).TO(
			ALI_SMS_RULE,
			QINIU_SMS_RULE,
			TENCENT_SMS_RULE,
			YUNPIAN_SMS_RULE,
			CACHE_SMS_RULE
		).build();

		// 创建完整规则链
		return LiteRule.THEN(PRE_SMS_RULE)
			.THEN(smsBuildRuleChain)
			.THEN(FINALLY_SMS_RULE)
			.build();
	}
}
