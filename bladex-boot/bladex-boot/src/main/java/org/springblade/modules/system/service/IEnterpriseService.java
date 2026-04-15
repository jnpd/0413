package org.springblade.modules.system.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import org.springblade.modules.system.pojo.dto.EnterpriseSubmitDTO;
import org.springblade.modules.system.pojo.entity.Enterprise;
import org.springblade.modules.system.pojo.vo.EnterpriseVO;

import java.util.List;

public interface IEnterpriseService extends IService<Enterprise> {

	IPage<EnterpriseVO> selectEnterprisePage(IPage<EnterpriseVO> page, EnterpriseVO enterprise);

	EnterpriseVO enterpriseDetail(Long enterpriseId);

	List<EnterpriseVO> enterpriseList();

	boolean submitEnterprise(EnterpriseSubmitDTO submitDTO);

	boolean removeEnterprise(String ids);
}
