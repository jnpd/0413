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


import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.AllArgsConstructor;
import org.springblade.core.mp.base.BaseServiceImpl;
import org.springblade.core.secure.utils.AuthUtil;
import org.springblade.core.tool.constant.BladeConstant;
import org.springblade.modules.system.pojo.entity.User;
import org.springblade.modules.system.mapper.UserMapper;
import org.springblade.modules.system.service.IUserSearchService;
import org.springframework.stereotype.Service;
import org.springblade.core.tool.utils.Func;
import org.springblade.core.tool.utils.StringUtil;

import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * 用户查询服务实现类
 *
 * @author Chill
 */
//@Master
@Service
@AllArgsConstructor
public class UserSearchServiceImpl extends BaseServiceImpl<UserMapper, User> implements IUserSearchService {

	@Override
	public List<User> listByUser(List<Long> userId) {
		return this.list(Wrappers.<User>lambdaQuery().in(User::getId, userId));
	}

	@Override
	public List<User> listByDept(List<Long> deptId) {
		LambdaQueryWrapper<User> queryWrapper = Wrappers.lambdaQuery();
		deptId.forEach(id -> queryWrapper.like(User::getDeptId, id).or());
		return this.list(queryWrapper);
	}

	@Override
	public List<User> listByPost(List<Long> postId) {
		LambdaQueryWrapper<User> queryWrapper = Wrappers.lambdaQuery();
		postId.forEach(id -> queryWrapper.like(User::getPostId, id).or());
		return this.list(queryWrapper);
	}

	@Override
	public List<User> listByRole(List<Long> roleId) {
		LambdaQueryWrapper<User> queryWrapper = Wrappers.lambdaQuery();
		roleId.forEach(id -> queryWrapper.like(User::getRoleId, id).or());
		return this.list(queryWrapper);
	}

	@Override
	public List<User> listLeader(String tenantId, String realName) {
		LambdaQueryWrapper<User> queryWrapper = Wrappers.<User>query().lambda()
			.select(User::getId, User::getRealName)
			.eq(User::getTenantId, Func.toStrWithEmpty(tenantId, AuthUtil.getTenantId()))
			.like(StringUtil.isNoneBlank(realName), User::getRealName, realName)
			.eq(User::getIsLeader, BladeConstant.DB_STATUS_1)
			.eq(User::getStatus, BladeConstant.DB_STATUS_NORMAL)
			.eq(User::getIsDeleted, BladeConstant.DB_NOT_DELETED);
		return this.list(queryWrapper);
	}

	@Override
	public List<User> getLeader(List<Long> userId) {
		if (Func.isEmpty(userId)) {
			return new ArrayList<>();
		}
		// 根据用户ID列表查询用户信息
		List<User> users = this.list(Wrappers.<User>lambdaQuery().in(User::getId, userId));
		if (Func.isEmpty(users)) {
			return new ArrayList<>();
		}
		// 收集所有用户的主管ID
		List<Long> allLeaderIds = users.stream()
			.filter(user -> StringUtil.isNotBlank(user.getLeaderId()))
			.flatMap(user -> Func.toLongList(user.getLeaderId()).stream())
			.distinct()
			.collect(Collectors.toList());
		if (Func.isEmpty(allLeaderIds)) {
			return new ArrayList<>();
		}
		// 根据主管ID列表查询主管用户信息
		return this.list(Wrappers.<User>lambdaQuery().in(User::getId, allLeaderIds));
	}
}
