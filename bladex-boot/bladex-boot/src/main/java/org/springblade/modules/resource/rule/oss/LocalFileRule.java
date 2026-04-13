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
import org.springblade.core.literule.core.RuleComponent;
import org.springblade.core.oss.LocalFileTemplate;
import org.springblade.core.oss.OssTemplate;
import org.springblade.core.oss.props.OssProperties;
import org.springblade.core.oss.rule.OssRule;
import org.springblade.modules.resource.pojo.entity.Oss;
import org.springblade.modules.resource.rule.context.OssContext;

import static org.springblade.modules.resource.rule.constant.OssRuleConstant.LOCAL_FILE_RULE;

/**
 * 本地云存储构建类
 *
 * @author Chill
 */
@LiteRuleComponent(id = LOCAL_FILE_RULE, name = "localFileOSS构建")
public class LocalFileRule extends RuleComponent {

	@Override
	public void process() {
		// 获取上下文
		OssContext contextBean = this.getContextBean(OssContext.class);
		Oss oss = contextBean.getOss();
		OssRule ossRule = contextBean.getOssRule();

		// 创建配置类
		OssProperties ossProperties = new OssProperties();
		ossProperties.setEndpoint(oss.getEndpoint());
		ossProperties.setTransformEndpoint(oss.getTransformEndpoint());
		ossProperties.setAccessKey(oss.getAccessKey());
		ossProperties.setBucketName(oss.getBucketName());

		OssTemplate ossTemplate = new LocalFileTemplate(ossRule, ossProperties);

		// 设置上下文
		contextBean.setOssTemplate(ossTemplate);

	}
}
