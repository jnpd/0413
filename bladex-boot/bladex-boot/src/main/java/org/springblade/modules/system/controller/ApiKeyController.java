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
package org.springblade.modules.system.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.github.xiaoymin.knife4j.annotations.ApiOperationSupport;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springblade.core.boot.ctrl.BladeController;
import org.springblade.core.launch.constant.AppConstant;
import org.springblade.core.mp.support.Condition;
import org.springblade.core.mp.support.Query;
import org.springblade.core.secure.annotation.IsAdmin;
import org.springblade.core.tenant.annotation.NonDS;
import org.springblade.core.tool.api.R;
import org.springblade.modules.system.pojo.entity.ApiKey;
import org.springblade.modules.system.pojo.vo.ApiKeyVO;
import org.springblade.modules.system.service.IApiKeyService;
import org.springblade.modules.system.wrapper.ApiKeyWrapper;
import org.springframework.web.bind.annotation.*;

/**
 * 令牌权限 控制器
 *
 * @author Chill
 */
@NonDS
@IsAdmin
@RestController
@AllArgsConstructor
@RequestMapping(AppConstant.APPLICATION_SYSTEM_NAME + "/api-key")
@Tag(name = "令牌权限", description = "令牌权限接口")
public class ApiKeyController extends BladeController {

	private final IApiKeyService apiKeyService;

	/**
	 * 详情
	 */
	@GetMapping("/detail")
	@ApiOperationSupport(order = 1)
	@Operation(summary = "详情", description = "传入apiKey")
	public R<ApiKeyVO> detail(ApiKey apiKey) {
		ApiKey detail = apiKeyService.getOne(Condition.getQueryWrapper(apiKey));
		return R.data(ApiKeyWrapper.build().entityVO(detail));
	}

	/**
	 * 分页
	 */
	@GetMapping("/list")
	@ApiOperationSupport(order = 2)
	@Operation(summary = "分页", description = "传入apiKey")
	public R<IPage<ApiKeyVO>> list(@Parameter(hidden = true) ApiKey apiKey, Query query) {
		IPage<ApiKey> pages = apiKeyService.page(Condition.getPage(query), Condition.getQueryWrapper(apiKey));
		return R.data(ApiKeyWrapper.build().pageVO(pages));
	}

	/**
	 * 自定义分页
	 */
	@GetMapping("/page")
	@ApiOperationSupport(order = 3)
	@Operation(summary = "自定义分页", description = "传入apiKey")
	public R<IPage<ApiKeyVO>> page(@Parameter(hidden = true) ApiKeyVO apiKey, Query query) {
		IPage<ApiKeyVO> pages = apiKeyService.selectApiKeyPage(Condition.getPage(query), apiKey);
		return R.data(pages);
	}

	/**
	 * 新增
	 */
	@PostMapping("/save")
	@ApiOperationSupport(order = 4)
	@Operation(summary = "新增", description = "传入apiKey")
	public R<String> save(@Valid @RequestBody ApiKey apiKey) {
		return R.data(apiKeyService.submitApiKey(apiKey));
	}

	/**
	 * 修改
	 */
	@PostMapping("/update")
	@ApiOperationSupport(order = 5)
	@Operation(summary = "修改", description = "传入apiKey")
	public R<String> update(@Valid @RequestBody ApiKey apiKey) {
		return R.data(apiKeyService.submitApiKey(apiKey));
	}

	/**
	 * 新增或修改
	 */
	@PostMapping("/submit")
	@ApiOperationSupport(order = 6)
	@Operation(summary = "新增或修改", description = "传入apiKey")
	public R<String> submit(@Valid @RequestBody ApiKey apiKey) {
		return R.data(apiKeyService.submitApiKey(apiKey));
	}

	/**
	 * 删除
	 */
	@PostMapping("/remove")
	@ApiOperationSupport(order = 7)
	@Operation(summary = "逻辑删除", description = "传入ids")
	public R<Boolean> remove(@Parameter(description = "主键集合", required = true) @RequestParam String ids) {
		return R.status(apiKeyService.removeApiKey(ids));
	}

	/**
	 * 启用
	 */
	@PostMapping("/enable")
	@ApiOperationSupport(order = 8)
	@Operation(summary = "启用", description = "传入ids")
	public R<Boolean> enable(@RequestParam String ids) {
		return R.status(apiKeyService.enableApiKey(ids));
	}

	/**
	 * 禁用
	 */
	@PostMapping("/disable")
	@ApiOperationSupport(order = 9)
	@Operation(summary = "禁用", description = "传入ids")
	public R<Boolean> disable(@RequestParam String ids) {
		return R.status(apiKeyService.disableApiKey(ids));
	}

}
