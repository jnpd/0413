package org.springblade.modules.system.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springblade.core.tool.constant.BladeConstant;
import org.springblade.core.tool.utils.Func;
import org.springblade.modules.system.mapper.UserEnterpriseMapper;
import org.springblade.modules.system.pojo.entity.UserEnterprise;
import org.springblade.modules.system.service.IUserEnterpriseService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserEnterpriseServiceImpl extends ServiceImpl<UserEnterpriseMapper, UserEnterprise> implements IUserEnterpriseService {

	@Override
	public List<Long> activeEnterpriseIds(Long userId) {
		return list(Wrappers.<UserEnterprise>lambdaQuery()
			.eq(UserEnterprise::getUserId, userId)
			.eq(UserEnterprise::getStatus, BladeConstant.DB_STATUS_NORMAL)
			.eq(UserEnterprise::getIsDeleted, BladeConstant.DB_NOT_DELETED))
			.stream()
			.map(UserEnterprise::getEnterpriseId)
			.filter(Func::isNotEmpty)
			.toList();
	}
}
