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
package org.springblade.modules.system.pojo.vo;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springblade.modules.system.pojo.entity.ApiKey;

import java.io.Serial;

/**
 * 令牌权限 视图对象
 *
 * @author Chill
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "ApiKeyVO对象")
public class ApiKeyVO extends ApiKey {

	@Serial
	private static final long serialVersionUID = 1L;

	/**
	 * 用户名
	 */
	@Schema(description = "用户名")
	private String userName;

	/**
	 * 用户账号
	 */
	@Schema(description = "用户账号")
	private String account;

	/**
	 * 状态名称
	 */
	@Schema(description = "状态名称")
	private String statusName;

	/**
	 * 过期时间信息
	 */
	@Schema(description = "过期时间信息")
	private String expireTimeInfo;

}

