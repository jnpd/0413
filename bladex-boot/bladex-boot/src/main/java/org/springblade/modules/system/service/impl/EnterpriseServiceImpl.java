package org.springblade.modules.system.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import lombok.AllArgsConstructor;
import org.springblade.core.log.exception.ServiceException;
import org.springblade.core.secure.utils.AuthUtil;
import org.springblade.core.tool.constant.BladeConstant;
import org.springblade.core.tool.constant.RoleConstant;
import org.springblade.core.tool.utils.Func;
import org.springblade.core.tool.utils.StringPool;
import org.springblade.core.tool.utils.StringUtil;
import org.springblade.modules.system.mapper.EnterpriseMapper;
import org.springblade.modules.system.pojo.dto.EnterpriseSubmitDTO;
import org.springblade.modules.system.pojo.entity.Enterprise;
import org.springblade.modules.system.pojo.entity.Role;
import org.springblade.modules.system.pojo.entity.User;
import org.springblade.modules.system.pojo.entity.UserEnterprise;
import org.springblade.modules.system.pojo.vo.EnterpriseVO;
import org.springblade.modules.system.service.IEnterpriseService;
import org.springblade.modules.system.service.IRoleService;
import org.springblade.modules.system.service.IUserEnterpriseService;
import org.springblade.modules.system.service.IUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class EnterpriseServiceImpl extends ServiceImpl<EnterpriseMapper, Enterprise> implements IEnterpriseService {

	private static final int ENTERPRISE_TYPE_WATER_COMPANY = 1;
	private static final int ENTERPRISE_TYPE_WATER_FACTORY = 2;
	private static final int STATUS_DISABLED = 0;
	private static final String ROLE_ALIAS_WATER_COMPANY_ADMIN = "water_company_admin";
	private static final String ROLE_ALIAS_WATER_FACTORY_ADMIN = "water_factory_admin";

	private final IUserService userService;
	private final IUserEnterpriseService userEnterpriseService;
	private final IRoleService roleService;

	@Override
	public IPage<EnterpriseVO> selectEnterprisePage(IPage<EnterpriseVO> page, EnterpriseVO enterprise) {
		Long accessibleUserId = isPlatformAdmin() ? null : AuthUtil.getUserId();
		String tenantId = currentTenantId();
		return page.setRecords(baseMapper.selectEnterprisePage(page, enterprise, tenantId, accessibleUserId));
	}

	@Override
	public EnterpriseVO enterpriseDetail(Long enterpriseId) {
		EnterpriseVO detail = baseMapper.selectEnterpriseDetail(enterpriseId, currentTenantId(), isPlatformAdmin() ? null : AuthUtil.getUserId());
		if (detail == null) {
			throw new ServiceException("企业不存在或无权访问");
		}
		return detail;
	}

	@Override
	public List<EnterpriseVO> enterpriseList() {
		return baseMapper.selectEnterpriseList(currentTenantId(), isPlatformAdmin() ? null : AuthUtil.getUserId());
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public boolean submitEnterprise(EnterpriseSubmitDTO submitDTO) {
		boolean creating = Func.isEmpty(submitDTO.getEnterpriseId());
		if (creating && !isPlatformAdmin()) {
			throw new ServiceException("仅平台管理员可新增企业");
		}

		Enterprise enterprise = creating ? new Enterprise() : getAccessibleEnterprise(submitDTO.getEnterpriseId());
		String tenantId = currentTenantId();
		User adminUser = loadAdminUserForSubmit(enterprise, submitDTO, tenantId);

		enterprise.setTenantId(tenantId);
		enterprise.setEnterpriseName(submitDTO.getEnterpriseName().trim());
		enterprise.setEnterpriseType(submitDTO.getEnterpriseType());
		enterprise.setAdminUserId(adminUser.getId());
		enterprise.setStatus(normalizeStatus(submitDTO.getStatus()));

		if (creating) {
			if (Func.isEmpty(enterprise.getEnterpriseId())) {
				enterprise.setEnterpriseId(IdWorker.getId());
			}
			enterprise.setEnterpriseCode("QY" + enterprise.getEnterpriseId());
			if (!userService.submit(adminUser)) {
				throw new ServiceException("创建企业管理员失败");
			}
			enterprise.setAdminUserId(adminUser.getId());
			if (!save(enterprise)) {
				throw new ServiceException("保存企业失败");
			}
		} else {
			if (Func.isEmpty(adminUser.getId())) {
				if (!userService.submit(adminUser)) {
					throw new ServiceException("创建企业管理员失败");
				}
				enterprise.setAdminUserId(adminUser.getId());
			} else if (!userService.updateUser(adminUser)) {
				throw new ServiceException("更新企业管理员失败");
			}
			if (!updateById(enterprise)) {
				throw new ServiceException("更新企业失败");
			}
		}

		upsertPrimaryAdminRelation(adminUser.getId(), enterprise.getEnterpriseId(), tenantId, enterprise.getStatus());
		return true;
	}

	@Override
	@Transactional(rollbackFor = Exception.class)
	public boolean removeEnterprise(String ids) {
		if (!isPlatformAdmin()) {
			throw new ServiceException("仅平台管理员可删除企业");
		}
		List<Long> enterpriseIds = Func.toLongList(ids);
		for (Long enterpriseId : enterpriseIds) {
			Enterprise enterprise = getById(enterpriseId);
			if (enterprise == null || Func.equals(enterprise.getIsDeleted(), BladeConstant.DB_IS_DELETED)) {
				throw new ServiceException("企业不存在");
			}
			if (baseMapper.countActiveNonAdminUsers(enterpriseId) > 0L) {
				throw new ServiceException("该企业下仍存在有效的非管理员人员账号，不能删除");
			}

			List<Long> relatedUserIds = baseMapper.selectRelatedUserIds(enterpriseId);
			userEnterpriseService.update(
				Wrappers.<UserEnterprise>lambdaUpdate()
					.set(UserEnterprise::getStatus, STATUS_DISABLED)
					.set(UserEnterprise::getIsDeleted, BladeConstant.DB_IS_DELETED)
					.eq(UserEnterprise::getEnterpriseId, enterpriseId)
					.eq(UserEnterprise::getIsDeleted, BladeConstant.DB_NOT_DELETED)
			);

			Enterprise update = new Enterprise();
			update.setEnterpriseId(enterpriseId);
			update.setStatus(STATUS_DISABLED);
			updateById(update);
			removeById(enterpriseId);

			for (Long relatedUserId : relatedUserIds) {
				long activeRelations = userEnterpriseService.count(
					Wrappers.<UserEnterprise>lambdaQuery()
						.eq(UserEnterprise::getUserId, relatedUserId)
						.eq(UserEnterprise::getStatus, BladeConstant.DB_STATUS_NORMAL)
						.eq(UserEnterprise::getIsDeleted, BladeConstant.DB_NOT_DELETED)
				);
				if (activeRelations == 0L && !isPlatformPrincipal(relatedUserId)) {
					User disableUser = new User();
					disableUser.setId(relatedUserId);
					disableUser.setStatus(STATUS_DISABLED);
					userService.updateById(disableUser);
				}
			}
		}
		return true;
	}

	private Enterprise getAccessibleEnterprise(Long enterpriseId) {
		EnterpriseVO detail = enterpriseDetail(enterpriseId);
		Enterprise enterprise = getById(detail.getEnterpriseId());
		if (enterprise == null) {
			throw new ServiceException("企业不存在");
		}
		return enterprise;
	}

	private User loadAdminUserForSubmit(Enterprise enterprise, EnterpriseSubmitDTO submitDTO, String tenantId) {
		User adminUser = Func.isNotEmpty(enterprise.getAdminUserId()) ? userService.getById(enterprise.getAdminUserId()) : null;
		boolean creatingAdmin = adminUser == null || Func.isEmpty(adminUser.getId());
		if (creatingAdmin && StringUtil.isBlank(submitDTO.getPassword())) {
			throw new ServiceException("新增企业管理员时初始密码不能为空");
		}

		if (adminUser == null) {
			adminUser = new User();
		}
		adminUser.setTenantId(tenantId);
		adminUser.setAccount(submitDTO.getLoginAccount().trim());
		adminUser.setRealName(submitDTO.getAdminName().trim());
		adminUser.setName(submitDTO.getAdminName().trim());
		adminUser.setRoleId(resolveAdminRoleId(tenantId, submitDTO.getEnterpriseType()));
		adminUser.setStatus(normalizeStatus(submitDTO.getStatus()));
		if (StringUtil.isNotBlank(submitDTO.getPassword())) {
			adminUser.setPassword(submitDTO.getPassword().trim());
		} else {
			adminUser.setPassword(null);
		}
		return adminUser;
	}

	private void upsertPrimaryAdminRelation(Long adminUserId, Long enterpriseId, String tenantId, Integer status) {
		UserEnterprise relation = userEnterpriseService.getOne(
			Wrappers.<UserEnterprise>lambdaQuery()
				.eq(UserEnterprise::getUserId, adminUserId)
				.eq(UserEnterprise::getEnterpriseId, enterpriseId)
				.last("limit 1")
		);
		if (relation == null) {
			relation = new UserEnterprise();
		}
		relation.setTenantId(tenantId);
		relation.setUserId(adminUserId);
		relation.setEnterpriseId(enterpriseId);
		relation.setIsAdmin(BladeConstant.DB_STATUS_NORMAL);
		relation.setStatus(normalizeStatus(status));
		relation.setIsDeleted(BladeConstant.DB_NOT_DELETED);
		userEnterpriseService.saveOrUpdate(relation);
	}

	private String resolveAdminRoleId(String tenantId, Integer enterpriseType) {
		String roleAlias = switch (enterpriseType) {
			case ENTERPRISE_TYPE_WATER_COMPANY -> ROLE_ALIAS_WATER_COMPANY_ADMIN;
			case ENTERPRISE_TYPE_WATER_FACTORY -> ROLE_ALIAS_WATER_FACTORY_ADMIN;
			default -> throw new ServiceException("不支持的企业类型");
		};
		Role role = roleService.getOne(Wrappers.<Role>lambdaQuery()
			.eq(Role::getTenantId, tenantId)
			.eq(Role::getRoleAlias, roleAlias)
			.eq(Role::getStatus, BladeConstant.DB_STATUS_NORMAL)
			.eq(Role::getIsDeleted, BladeConstant.DB_NOT_DELETED)
			.last("limit 1"));
		if (role == null || Func.isEmpty(role.getId())) {
			throw new ServiceException("未找到企业管理员角色：" + roleAlias);
		}
		return Func.toStr(role.getId());
	}

	private boolean isPlatformPrincipal(Long userId) {
		User user = userService.getById(userId);
		if (user == null || StringUtil.isBlank(user.getRoleId())) {
			return false;
		}
		List<String> roleAliases = roleService.getRoleAliases(user.getRoleId());
		return roleAliases.contains(RoleConstant.ADMINISTRATOR) || roleAliases.contains(RoleConstant.ADMIN);
	}

	private boolean isPlatformAdmin() {
		return AuthUtil.isAdmin() || AuthUtil.isAdministrator();
	}

	private Integer normalizeStatus(Integer status) {
		return Func.toInt(status, BladeConstant.DB_STATUS_NORMAL);
	}

	private String currentTenantId() {
		return StringUtil.isBlank(AuthUtil.getTenantId()) ? BladeConstant.ADMIN_TENANT_ID : AuthUtil.getTenantId();
	}
}
