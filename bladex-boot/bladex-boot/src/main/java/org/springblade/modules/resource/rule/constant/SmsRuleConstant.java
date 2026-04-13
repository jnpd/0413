package org.springblade.modules.resource.rule.constant;

/**
 * SmsRuleConstant
 *
 * @author BladeX
 */
public interface SmsRuleConstant {
	/**
	 * SMS规则链ID
	 */
	String SMS_CHAIN_ID = "smsChain";

	/**
	 * 预处理SMS规则
	 */
	String PRE_SMS_RULE = "preSmsRule";

	/**
	 * SMS构建条件判断规则
	 */
	String SMS_BUILD_RULE = "smsBuildRule";

	/**
	 * 阿里云SMS规则
	 */
	String ALI_SMS_RULE = "aliSmsRule";

	/**
	 * 七牛云SMS规则
	 */
	String QINIU_SMS_RULE = "qiniuSmsRule";

	/**
	 * 腾讯云SMS规则
	 */
	String TENCENT_SMS_RULE = "tencentSmsRule";

	/**
	 * 云片SMS规则
	 */
	String YUNPIAN_SMS_RULE = "yunpianSmsRule";

	/**
	 * 缓存SMS规则
	 */
	String CACHE_SMS_RULE = "cacheSmsRule";

	/**
	 * 最终SMS规则
	 */
	String FINALLY_SMS_RULE = "finallySmsRule";
}
