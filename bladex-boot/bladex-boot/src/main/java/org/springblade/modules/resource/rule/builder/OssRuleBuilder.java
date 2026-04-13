package org.springblade.modules.resource.rule.builder;

import org.springblade.core.literule.annotation.RuleEngineComponent;
import org.springblade.core.literule.builder.LiteRule;
import org.springblade.core.literule.builder.RuleBuilder;
import org.springblade.core.literule.builder.chain.RuleChain;

import static org.springblade.modules.resource.rule.constant.OssRuleConstant.*;

/**
 * Oss规则链构建器
 *
 * @author BladeX
 */
@RuleEngineComponent(id = OSS_CHAIN_ID)
public class OssRuleBuilder implements RuleBuilder {
	@Override
	public RuleChain build() {
		// 创建OSS缓存判断规则链
		RuleChain ossCacheRuleChain = LiteRule.SWITCH(OSS_CACHE_RULE).TO(
			OSS_READ_RULE,
			LiteRule.THEN(OSS_DATA_RULE)
				.THEN(
					LiteRule.SWITCH(OSS_BUILD_RULE).TO(
						ALI_OSS_RULE,
						AMAZON_S3_RULE,
						HUAWEI_OBS_RULE,
						MINIO_RULE,
						QINIU_OSS_RULE,
						TENCENT_COS_RULE,
						LOCAL_FILE_RULE
					).build()
				)
				.THEN(OSS_TEMPLATE_RULE)
				.ID(OSS_NEW_RULE)// 设置规则链ID方可在Switch节点进行调用
				.build()
		).build();

		// 创建完整规则链
		return LiteRule.THEN(PRE_OSS_RULE)
			.THEN(ossCacheRuleChain)
			.THEN(FINALLY_OSS_RULE)
			.build();
	}
}
