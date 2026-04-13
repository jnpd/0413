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
package org.springblade.modules.system.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import org.springblade.core.mp.base.BaseService;
import org.springblade.modules.system.pojo.entity.ApiKey;
import org.springblade.modules.system.pojo.vo.ApiKeyVO;

/**
 * 令牌权限 服务类
 *
 * @author Chill
 */
public interface IApiKeyService extends BaseService<ApiKey> {

	/**
	 * 根据 apiKey 获取实体
	 *
	 * @param apiKey 令牌
	 * @return ApiKey
	 */
	ApiKey getByApiKey(String apiKey);

	/**
	 * 自定义分页
	 *
	 * @param page   分页
	 * @param apiKey 实体
	 * @return IPage<ApiKeyVO>
	 */
	IPage<ApiKeyVO> selectApiKeyPage(IPage<ApiKeyVO> page, ApiKeyVO apiKey);

	/**
	 * 创建 令牌权限
	 *
	 * @param apiKey 实体
	 * @return 生成的 令牌权限
	 */
	String createApiKey(ApiKey apiKey);

	/**
	 * 新增或修改 令牌权限
	 *
	 * @param apiKey 实体
	 * @return 令牌权限
	 */
	String submitApiKey(ApiKey apiKey);

	/**
	 * 删除 令牌权限
	 *
	 * @param apiKeys 令牌权限 集合 (逗号分隔)
	 * @return 是否成功
	 */
	boolean removeApiKey(String apiKeys);

	/**
	 * 启用 令牌权限
	 *
	 * @param ids 主键集合 (逗号分隔)
	 * @return 是否成功
	 */
	boolean enableApiKey(String ids);

	/**
	 * 禁用 令牌权限
	 *
	 * @param ids 主键集合 (逗号分隔)
	 * @return 是否成功
	 */
	boolean disableApiKey(String ids);

}
