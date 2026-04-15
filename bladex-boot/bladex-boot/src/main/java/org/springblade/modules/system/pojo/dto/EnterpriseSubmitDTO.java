package org.springblade.modules.system.pojo.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
@Schema(description = "EnterpriseSubmitDTO对象")
public class EnterpriseSubmitDTO implements Serializable {

	@Serial
	private static final long serialVersionUID = 1L;

	@JsonSerialize(using = ToStringSerializer.class)
	@Schema(description = "企业ID")
	private Long enterpriseId;

	@NotBlank(message = "企业名称不能为空")
	@Schema(description = "企业名称")
	private String enterpriseName;

	@NotNull(message = "企业类型不能为空")
	@Schema(description = "企业类型")
	private Integer enterpriseType;

	@NotBlank(message = "管理员姓名不能为空")
	@Schema(description = "管理员姓名")
	private String adminName;

	@NotBlank(message = "登录账号不能为空")
	@Schema(description = "登录账号")
	private String loginAccount;

	@Schema(description = "密码")
	private String password;

	@Schema(description = "状态")
	private Integer status;
}
