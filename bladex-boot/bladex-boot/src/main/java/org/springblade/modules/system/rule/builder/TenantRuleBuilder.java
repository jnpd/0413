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
package org.springblade.modules.system.rule.builder;

import org.springblade.core.literule.annotation.RuleEngineComponent;
import org.springblade.core.literule.builder.LiteRule;
import org.springblade.core.literule.builder.RuleBuilder;
import org.springblade.core.literule.builder.chain.RuleChain;

import static org.springblade.modules.system.rule.constant.TenantRuleConstant.*;

/**
 * 租户编排规则链构建器
 *
 * @author BladeX
 */
@RuleEngineComponent(id = TENANT_CHAIN_ID)
public class TenantRuleBuilder implements RuleBuilder {
	@Override
	public RuleChain build() {
		// 创建并行规则链
		RuleChain whenRule = LiteRule.WHEN(
			TENANT_ROLE_RULE, TENANT_ROLE_MENU_RULE, TENANT_DEPT_RULE, TENANT_POST_RULE, TENANT_DICT_BIZ_RULE, TENANT_USER_RULE
		).build();

		// 创建完整规则链
		return LiteRule.THEN(TENANT_RULE)
			.THEN(whenRule)
			.build();
	}
}
