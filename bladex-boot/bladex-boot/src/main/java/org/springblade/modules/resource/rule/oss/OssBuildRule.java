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
import org.springblade.core.log.exception.ServiceException;
import org.springblade.core.oss.enums.OssEnum;
import org.springblade.modules.resource.pojo.entity.Oss;
import org.springblade.modules.resource.rule.context.OssContext;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.springblade.modules.resource.rule.constant.OssRuleConstant.OSS_BUILD_RULE;

/**
 * Oss构建判断
 *
 * @author Chill
 */
@LiteRuleComponent(id = OSS_BUILD_RULE, name = "OSS构建条件判断")
public class OssBuildRule extends RuleSwitchComponent {
	private static final Map<Integer, String> CATEGORY_RULE_MAP = new HashMap<>();

	static {
		CATEGORY_RULE_MAP.put(OssEnum.MINIO.getCategory(), "minioRule");
		CATEGORY_RULE_MAP.put(OssEnum.QINIU.getCategory(), "qiniuOssRule");
		CATEGORY_RULE_MAP.put(OssEnum.ALI.getCategory(), "aliOssRule");
		CATEGORY_RULE_MAP.put(OssEnum.TENCENT.getCategory(), "tencentCosRule");
		CATEGORY_RULE_MAP.put(OssEnum.HUAWEI.getCategory(), "huaweiObsRule");
		CATEGORY_RULE_MAP.put(OssEnum.AMAZONS3.getCategory(), "amazonS3Rule");
		CATEGORY_RULE_MAP.put(OssEnum.LOCAL.getCategory(), "localFileRule");
	}

	@Override
	public List<String> process() {
		OssContext contextBean = this.getContextBean(OssContext.class);
		Oss oss = contextBean.getOss();

		String ruleName = CATEGORY_RULE_MAP.get(oss.getCategory());
		if (ruleName != null) {
			return Collections.singletonList(ruleName);
		}
		throw new ServiceException("未找到OSS配置");
	}
}
