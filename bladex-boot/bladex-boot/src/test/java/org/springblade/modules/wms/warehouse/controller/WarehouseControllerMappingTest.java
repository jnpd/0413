package org.springblade.modules.wms.warehouse.controller;

import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.lang.reflect.Method;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class WarehouseControllerMappingTest {

	@Test
	void controllerShouldUseWarehouseRoutePrefix() {
		RequestMapping mapping = WarehouseController.class.getAnnotation(RequestMapping.class);
		assertNotNull(mapping, "WarehouseController should declare RequestMapping");
		assertArrayEquals(new String[]{"/blade-wms/warehouse"}, mapping.value());
	}

	@Test
	void controllerShouldExposeSpecEndpoints() throws NoSuchMethodException {
		assertArrayEquals(new String[]{"/stat"}, getGetMapping("stat"));
		assertArrayEquals(new String[]{"/page"}, getGetMapping("page"));
		assertArrayEquals(new String[]{"/detail"}, getGetMapping("detail"));
		assertArrayEquals(new String[]{"/submit"}, getPostMapping("submit"));
		assertArrayEquals(new String[]{"/remove"}, getPostMapping("remove"));
		assertArrayEquals(new String[]{"/import"}, getPostMapping("importData"));
		assertArrayEquals(new String[]{"/outbound"}, getPostMapping("outbound"));
	}

	private String[] getGetMapping(String methodName) throws NoSuchMethodException {
		Method method = findMethod(methodName);
		GetMapping mapping = method.getAnnotation(GetMapping.class);
		assertNotNull(mapping, () -> methodName + " should declare GetMapping");
		return mapping.value().length == 0 ? mapping.path() : mapping.value();
	}

	private String[] getPostMapping(String methodName) throws NoSuchMethodException {
		Method method = findMethod(methodName);
		PostMapping mapping = method.getAnnotation(PostMapping.class);
		assertNotNull(mapping, () -> methodName + " should declare PostMapping");
		return mapping.value().length == 0 ? mapping.path() : mapping.value();
	}

	private Method findMethod(String methodName) throws NoSuchMethodException {
		return Arrays.stream(WarehouseController.class.getDeclaredMethods())
			.filter(method -> method.getName().equals(methodName))
			.findFirst()
			.orElseThrow(() -> new NoSuchMethodException(methodName));
	}
}
