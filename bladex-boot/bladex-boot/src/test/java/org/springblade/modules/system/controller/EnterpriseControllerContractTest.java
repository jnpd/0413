package org.springblade.modules.system.controller;

import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class EnterpriseControllerContractTest {

	@Test
	void enterpriseController_exposes_required_contract_endpoints() throws Exception {
		Class<?> controllerClass = Class.forName("org.springblade.modules.system.controller.EnterpriseController");
		RequestMapping requestMapping = controllerClass.getAnnotation(RequestMapping.class);
		assertNotNull(requestMapping, "EnterpriseController must declare a class-level RequestMapping");
		assertEquals("blade-system/enterprise", requestMapping.value()[0], "EnterpriseController should be mounted under blade-system/enterprise");

		Map<String, String> getMappings = new HashMap<>();
		Map<String, String> postMappings = new HashMap<>();
		for (Method method : controllerClass.getDeclaredMethods()) {
			GetMapping getMapping = method.getAnnotation(GetMapping.class);
			if (getMapping != null && getMapping.value().length > 0) {
				getMappings.put(getMapping.value()[0], method.getName());
			}
			PostMapping postMapping = method.getAnnotation(PostMapping.class);
			if (postMapping != null && postMapping.value().length > 0) {
				postMappings.put(postMapping.value()[0], method.getName());
			}
		}

		assertEquals("page", getMappings.get("/page"), "EnterpriseController must expose GET /page");
		assertEquals("detail", getMappings.get("/detail"), "EnterpriseController must expose GET /detail");
		assertEquals("list", getMappings.get("/list"), "EnterpriseController must expose GET /list");
		assertEquals("submit", postMappings.get("/submit"), "EnterpriseController must expose POST /submit");
		assertEquals("remove", postMappings.get("/remove"), "EnterpriseController must expose POST /remove");
	}
}
