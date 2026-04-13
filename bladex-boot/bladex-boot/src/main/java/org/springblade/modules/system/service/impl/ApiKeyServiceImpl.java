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
package org.springblade.modules.system.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.AllArgsConstructor;
import org.springblade.core.mp.base.BaseServiceImpl;
import org.springblade.core.mp.enums.StatusType;
import org.springblade.core.secure.handler.IApiKeyHandler;
import org.springblade.core.secure.utils.AuthUtil;
import org.springblade.core.tenant.TenantUtil;
import org.springblade.core.tool.utils.Func;
import org.springblade.modules.system.mapper.ApiKeyMapper;
import org.springblade.modules.system.pojo.entity.ApiKey;
import org.springblade.modules.system.pojo.vo.ApiKeyVO;
import org.springblade.modules.system.service.IApiKeyService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 令牌权限 服务实现类
 *
 * @author Chill
 */
@Service
@AllArgsConstructor
public class ApiKeyServiceImpl extends BaseServiceImpl<ApiKeyMapper, ApiKey> implements IApiKeyService {

	private final IApiKeyHandler apiKeyHandler;

	@Override
	public ApiKey getByApiKey(String apiKey) {
		return TenantUtil.ignore(() -> this.getOne(Wrappers.<ApiKey>lambdaQuery().eq(ApiKey::getApiKey, apiKey)));
	}

	@Override
	public IPage<ApiKeyVO> selectApiKeyPage(IPage<ApiKeyVO> page, ApiKeyVO apiKey) {
		apiKey.setTenantId(AuthUtil.getTenantId());
		List<ApiKeyVO> records = baseMapper.selectApiKeyPage(page, apiKey);
		return page.setRecords(records);
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public String createApiKey(ApiKey apiKey) {
		String key = generateKey();
		apiKey.setApiKey(key);
		this.save(apiKey);
		return key;
	}

	/**
	 * 生成唯一的 API Key
	 * 递归检查生成的 key 是否已存在，确保唯一性
	 *
	 * @return 唯一的 API Key
	 */
	private String generateKey() {
		String key = apiKeyHandler.generateKey();
		ApiKey existingKey = getByApiKey(key);
		if (existingKey == null) {
			return key;
		}
		return generateKey();
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public String submitApiKey(ApiKey apiKey) {
		if (Func.isNotEmpty(apiKey.getId())) {
			// 由于返回前端的key是脱敏的，所以获取数据库中的完整key进行缓存更新
			ApiKey entity = this.getById(apiKey.getId());
			apiKeyHandler.removeCache(entity.getApiKey());
			// 更新时，避免覆盖 apiKey 字段
			apiKey.setApiKey(null);
			this.updateById(apiKey);
			return apiKey.getApiKey();
		} else {
			return createApiKey(apiKey);
		}
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public boolean removeApiKey(String ids) {
		List<Long> keyList = Func.toLongList(ids);
		List<ApiKey> apiKeys = this.listByIds(keyList);
		apiKeys.forEach(apiKey -> apiKeyHandler.removeCache(apiKey.getApiKey()));
		return removeByIds(keyList);
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public boolean enableApiKey(String ids) {
		return changeApiKeyStatus(ids, StatusType.ACTIVE.getType());
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public boolean disableApiKey(String ids) {
		return changeApiKeyStatus(ids, StatusType.DISABLED.getType());
	}

	/**
	 * 变更 令牌权限 状态
	 *
	 * @param ids    主键集合 (逗号分隔)
	 * @param status 状态
	 * @return 是否成功
	 */
	private boolean changeApiKeyStatus(String ids, Integer status) {
		List<Long> idList = Func.toLongList(ids);
		List<ApiKey> apiKeys = this.listByIds(idList);
		apiKeys.forEach(apiKey -> apiKeyHandler.removeCache(apiKey.getApiKey()));
		return this.changeStatus(idList, status);
	}

}
