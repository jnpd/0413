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
package org.springblade.modules.system.pojo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springblade.core.tenant.mp.TenantEntity;
import org.springblade.core.tool.jackson.Sensitive;
import org.springblade.core.tool.sensitive.SensitiveType;

import java.io.Serial;
import java.util.Date;

/**
 * 令牌权限 实体类
 *
 * @author Chill
 */
@Data
@TableName("blade_api_key")
@EqualsAndHashCode(callSuper = true)
@Schema(description = "ApiKey对象")
public class ApiKey extends TenantEntity {

	@Serial
	private static final long serialVersionUID = 1L;

	/**
	 * 主键
	 */
	@JsonSerialize(using = ToStringSerializer.class)
	@Schema(description = "主键")
	@TableId(value = "id", type = IdType.ASSIGN_ID)
	private Long id;

	/**
	 * 令牌权限
	 */
	@Sensitive(type = SensitiveType.KEYS)
	@Schema(description = "API Key")
	private String apiKey;

	/**
	 * 用户ID
	 */
	@JsonSerialize(using = ToStringSerializer.class)
	@Schema(description = "用户ID")
	private Long userId;

	/**
	 * 密钥名称
	 */
	@Schema(description = "密钥名称")
	private String name;

	/**
	 * 过期时间
	 */
	@Schema(description = "过期时间")
	private Date expireTime;

	/**
	 * 扩展参数 (JSON格式, 存储 userId, deptId, roleId 等)
	 */
	@Schema(description = "扩展参数")
	private String extParams;

	/**
	 * 访问权限 (逗号分隔的URL路径，支持Ant风格匹配)
	 */
	@Schema(description = "访问权限")
	private String apiPath;

}
