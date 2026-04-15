package org.springblade.modules.system.pojo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@TableName("biz_user_enterprise")
@Schema(description = "UserEnterprise对象")
public class UserEnterprise implements Serializable {

	@Serial
	private static final long serialVersionUID = 1L;

	@JsonSerialize(using = ToStringSerializer.class)
	@TableId(value = "id", type = IdType.ASSIGN_ID)
	@Schema(description = "主键")
	private Long id;

	@Schema(description = "租户ID")
	private String tenantId;

	@JsonSerialize(using = ToStringSerializer.class)
	@Schema(description = "用户ID")
	private Long userId;

	@JsonSerialize(using = ToStringSerializer.class)
	@Schema(description = "企业ID")
	private Long enterpriseId;

	@Schema(description = "是否企业管理员")
	private Integer isAdmin;

	@JsonSerialize(using = ToStringSerializer.class)
	@Schema(description = "创建人")
	private Long createUser;

	@Schema(description = "创建时间")
	private Date createTime;

	@JsonSerialize(using = ToStringSerializer.class)
	@Schema(description = "更新人")
	private Long updateUser;

	@Schema(description = "更新时间")
	private Date updateTime;

	@Schema(description = "状态")
	private Integer status;

	@TableLogic
	@Schema(description = "是否删除")
	private Integer isDeleted;
}
