package org.springblade.modules.system.controller;

import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.GetMapping;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class RoleControllerPageMappingTest {

	@Test
	void roleController_exposes_page_endpoint() {
		Method pageMethod = null;
		for (Method method : RoleController.class.getDeclaredMethods()) {
			GetMapping getMapping = method.getAnnotation(GetMapping.class);
			if (getMapping != null && getMapping.value().length > 0 && "/page".equals(getMapping.value()[0])) {
				pageMethod = method;
				break;
			}
		}

		assertNotNull(pageMethod, "RoleController must expose GET /page for paginated role management");
	}
}
