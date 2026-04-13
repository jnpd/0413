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
package org.springblade.modules.resource.rule.oss;

import org.springblade.core.literule.annotation.LiteRuleComponent;
import org.springblade.core.literule.core.RuleSwitchComponent;
import org.springblade.modules.resource.rule.context.OssContext;

import java.util.Collections;
import java.util.List;

import static org.springblade.modules.resource.rule.constant.OssRuleConstant.*;

/**
 * Oss缓存判断
 *
 * @author Chill
 */
@LiteRuleComponent(id = OSS_CACHE_RULE, name = "OSS缓存判断")
public class OssCacheRule extends RuleSwitchComponent {

	@Override
	public List<String> process() {
		OssContext contextBean = this.getContextBean(OssContext.class);
		// 若判断配置已缓存则直接读取，否则进入下一步构建新数据
		String ruleName = contextBean.getIsCached() ? OSS_READ_RULE : OSS_NEW_RULE;
		return Collections.singletonList(ruleName);
	}

}
