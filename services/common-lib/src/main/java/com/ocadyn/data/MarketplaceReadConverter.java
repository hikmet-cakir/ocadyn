package com.ocadyn.data;

import com.ocadyn.common.Marketplace;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

@ReadingConverter
public class MarketplaceReadConverter implements Converter<String, Marketplace> {

    @Override
    public Marketplace convert(String source) {
        if (source == null || source.isBlank()) {
            return Marketplace.OTHER;
        }
        try {
            return Marketplace.valueOf(source);
        } catch (IllegalArgumentException ex) {
            return Marketplace.OTHER;
        }
    }
}
