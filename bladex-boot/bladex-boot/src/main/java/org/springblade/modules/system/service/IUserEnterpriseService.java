package org.springblade.modules.system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import org.springblade.modules.system.pojo.entity.UserEnterprise;

import java.util.List;

public interface IUserEnterpriseService extends IService<UserEnterprise> {

	List<Long> activeEnterpriseIds(Long userId);
}
