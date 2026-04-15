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
import org.springblade.core.secure.annotation.PreAuth;
import org.springblade.core.tenant.annotation.NonDS;
import org.springblade.core.tool.api.R;
import org.springblade.modules.system.pojo.dto.EnterpriseSubmitDTO;
import org.springblade.modules.system.pojo.vo.EnterpriseVO;
import org.springblade.modules.system.service.IEnterpriseService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@NonDS
@RestController
@AllArgsConstructor
@PreAuth(menu = "user")
@RequestMapping(AppConstant.APPLICATION_SYSTEM_NAME + "/enterprise")
@Tag(name = "企业管理", description = "企业管理")
public class EnterpriseController extends BladeController {

	private final IEnterpriseService enterpriseService;

	@GetMapping("/page")
	@ApiOperationSupport(order = 1)
	@Operation(summary = "企业分页", description = "企业分页")
	public R<IPage<EnterpriseVO>> page(EnterpriseVO enterprise, Query query) {
		return R.data(enterpriseService.selectEnterprisePage(Condition.getPage(query), enterprise));
	}

	@GetMapping("/detail")
	@ApiOperationSupport(order = 2)
	@Operation(summary = "企业详情", description = "传入enterpriseId")
	public R<EnterpriseVO> detail(@Parameter(description = "企业ID", required = true) Long enterpriseId) {
		return R.data(enterpriseService.enterpriseDetail(enterpriseId));
	}

	@GetMapping("/list")
	@ApiOperationSupport(order = 3)
	@Operation(summary = "企业列表", description = "企业下拉列表")
	public R<List<EnterpriseVO>> list() {
		return R.data(enterpriseService.enterpriseList());
	}

	@PostMapping("/submit")
	@ApiOperationSupport(order = 4)
	@Operation(summary = "企业新增或修改", description = "传入EnterpriseSubmitDTO")
	public R submit(@Valid @RequestBody EnterpriseSubmitDTO submitDTO) {
		return R.status(enterpriseService.submitEnterprise(submitDTO));
	}

	@PostMapping("/remove")
	@ApiOperationSupport(order = 5)
	@Operation(summary = "企业删除", description = "传入ids")
	public R remove(@RequestParam String ids) {
		return R.status(enterpriseService.removeEnterprise(ids));
	}
}
