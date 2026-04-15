package org.springblade.modules.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import org.apache.ibatis.annotations.Param;
import org.springblade.modules.system.pojo.entity.Enterprise;
import org.springblade.modules.system.pojo.vo.EnterpriseVO;

import java.util.List;

public interface EnterpriseMapper extends BaseMapper<Enterprise> {

	List<EnterpriseVO> selectEnterprisePage(IPage<EnterpriseVO> page,
		@Param("enterprise") EnterpriseVO enterprise,
		@Param("tenantId") String tenantId,
		@Param("accessibleUserId") Long accessibleUserId);

	EnterpriseVO selectEnterpriseDetail(@Param("enterpriseId") Long enterpriseId,
		@Param("tenantId") String tenantId,
		@Param("accessibleUserId") Long accessibleUserId);

	List<EnterpriseVO> selectEnterpriseList(@Param("tenantId") String tenantId,
		@Param("accessibleUserId") Long accessibleUserId);

	long countActiveNonAdminUsers(@Param("enterpriseId") Long enterpriseId);

	List<Long> selectRelatedUserIds(@Param("enterpriseId") Long enterpriseId);
}
